// @ts-check
/// <reference path="./kb-types.d.ts" />

(function (window) {
  'use strict';

  if (window.kbVirtualList) {
    return;
  }

  var DEFAULT_OVERSCAN = 6;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function now() {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }

  /**
   * 零依赖虚拟滚动引擎（固定行高，DOM 复用，rAF 合并滚动更新）
   *
   * 设计约束：
   * - 目标是“10 万条数据仍可用”，因此只渲染可视区域 + overscan
   * - 行高必须固定（itemHeight），这是换取 60fps 的核心前提
   *
   * @template T
   * @param {HTMLElement} host 可滚动容器（需要有固定高度且 overflow: auto）
   * @param {{
   *   items: T[],
   *   itemHeight: number,
   *   renderItem: (el: HTMLElement, item: T, index: number) => void,
   *   overscan?: number,
   *   className?: string,
   * }} options
   */
  function kbVirtualList(host, options) {
    if (!host) {
      throw new Error('kbVirtualList: host required');
    }
    var opts = options || /** @type {any} */ ({});
    var items = Array.isArray(opts.items) ? opts.items : [];
    var itemHeight = Number(opts.itemHeight || 0);
    if (!itemHeight || itemHeight < 8) {
      throw new Error('kbVirtualList: itemHeight must be a positive number (>= 8)');
    }
    if (typeof opts.renderItem !== 'function') {
      throw new Error('kbVirtualList: renderItem required');
    }

    var overscan = clamp(Number(opts.overscan || DEFAULT_OVERSCAN), 0, 50);

    var root = document.createElement('div');
    root.className = opts.className || 'kb-virtual-root';
    root.style.position = 'relative';
    root.style.width = '100%';

    var spacer = document.createElement('div');
    spacer.className = 'kb-virtual-spacer';
    spacer.style.width = '1px';
    spacer.style.opacity = '0';

    var viewport = document.createElement('div');
    viewport.className = 'kb-virtual-viewport';
    viewport.style.position = 'absolute';
    viewport.style.left = '0';
    viewport.style.top = '0';
    viewport.style.right = '0';
    viewport.style.willChange = 'transform';

    root.appendChild(spacer);
    root.appendChild(viewport);

    // 清空 host 并挂载
    while (host.firstChild) {
      host.removeChild(host.firstChild);
    }
    host.appendChild(root);

    /** @type {HTMLElement[]} */
    var pool = [];
    var lastFrom = -1;
    var lastTo = -1;
    var rafId = 0;
    var destroyed = false;

    function poolSize() {
      var h = host.clientHeight || 0;
      var visible = Math.ceil(h / itemHeight);
      return clamp(visible + overscan * 2, 8, 400);
    }

    function ensurePool() {
      var needed = poolSize();
      while (pool.length < needed) {
        var row = document.createElement('div');
        row.className = 'kb-virtual-row';
        row.style.position = 'absolute';
        row.style.left = '0';
        row.style.right = '0';
        row.style.height = itemHeight + 'px';
        row.style.transform = 'translateY(0)';
        viewport.appendChild(row);
        pool.push(row);
      }
      while (pool.length > needed) {
        var last = pool.pop();
        if (last && last.parentNode) {
          last.parentNode.removeChild(last);
        }
      }
    }

    function updateSpacer() {
      spacer.style.height = items.length * itemHeight + 'px';
    }

    function renderRange(fromIndex, toIndex) {
      if (destroyed) {
        return;
      }
      if (fromIndex === lastFrom && toIndex === lastTo) {
        return;
      }
      lastFrom = fromIndex;
      lastTo = toIndex;

      var y = fromIndex * itemHeight;
      viewport.style.transform = 'translateY(' + y + 'px)';

      var poolIndex = 0;
      for (var i = fromIndex; i < toIndex; i++) {
        var el = pool[poolIndex++];
        if (!el) {
          break;
        }
        el.style.transform = 'translateY(' + (i - fromIndex) * itemHeight + 'px)';
        opts.renderItem(el, items[i], i);
      }
      // 多余 pool 元素隐藏（避免旧内容闪现）
      for (; poolIndex < pool.length; poolIndex++) {
        var extra = pool[poolIndex];
        if (extra) {
          extra.style.transform = 'translateY(-999999px)';
        }
      }
    }

    function computeAndRender() {
      rafId = 0;
      if (destroyed) {
        return;
      }
      ensurePool();
      updateSpacer();
      var scrollTop = host.scrollTop || 0;
      var height = host.clientHeight || 0;
      var first = Math.floor(scrollTop / itemHeight) - overscan;
      var from = clamp(first, 0, Math.max(0, items.length - 1));
      var visible = Math.ceil(height / itemHeight) + overscan * 2;
      var to = clamp(from + visible, 0, items.length);
      renderRange(from, to);
    }

    function schedule() {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(computeAndRender);
    }

    function onScroll() {
      schedule();
    }

    function onResize() {
      schedule();
    }

    host.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // 初次渲染
    computeAndRender();

    return {
      /**
       * @param {any[]} next
       */
      setItems: function (next) {
        items = Array.isArray(next) ? next : [];
        lastFrom = -1;
        lastTo = -1;
        schedule();
      },
      /**
       * 快速健康检查：输出当前渲染池大小、估算 FPS 采样等
       */
      profile: function () {
        var start = now();
        var frames = 0;
        return new Promise(function (resolve) {
          function tick() {
            frames += 1;
            if (now() - start >= 1000) {
              resolve({
                items: items.length,
                itemHeight: itemHeight,
                pool: pool.length,
                fps: frames
              });
              return;
            }
            window.requestAnimationFrame(tick);
          }
          window.requestAnimationFrame(tick);
        });
      },
      destroy: function () {
        destroyed = true;
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        host.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        while (host.firstChild) {
          host.removeChild(host.firstChild);
        }
      }
    };
  }

  window.kbVirtualList = kbVirtualList;
})(window);

