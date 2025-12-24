// @ts-check
/// <reference path="./kb-types.d.ts" />

(function (window, document) {
  'use strict';

  if (window.kbDiagnostics) {
    return;
  }

  var started = false;
  var timerId = 0;
  var longTaskObserver = null;
  var longTasks = { count: 0, totalMs: 0, lastAt: 0 };
  var heapHistory = [];

  function safeNow() {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }

  function safeMemory() {
    var mem = performance && performance.memory ? performance.memory : null;
    if (!mem) {
      return null;
    }
    return {
      usedJSHeapSize: mem.usedJSHeapSize,
      totalJSHeapSize: mem.totalJSHeapSize,
      jsHeapSizeLimit: mem.jsHeapSizeLimit
    };
  }

  function formatBytes(bytes) {
    if (!bytes || bytes < 0) {
      return '0 B';
    }
    var units = ['B', 'KB', 'MB', 'GB'];
    var idx = 0;
    var value = bytes;
    while (value >= 1024 && idx < units.length - 1) {
      value /= 1024;
      idx += 1;
    }
    return value.toFixed(idx === 0 ? 0 : 1) + ' ' + units[idx];
  }

  function getNavTiming() {
    var nav = null;
    try {
      var entries = performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
      if (entries && entries.length) {
        nav = entries[0];
      }
    } catch (e) {
      nav = null;
    }
    if (!nav) {
      return null;
    }
    return {
      type: nav.type,
      ttfbMs: Math.round(nav.responseStart - nav.requestStart),
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
      loadMs: Math.round(nav.loadEventEnd),
      transferSize: nav.transferSize || 0
    };
  }

  function getResourceStats() {
    try {
      var resources = performance.getEntriesByType ? performance.getEntriesByType('resource') : [];
      if (!resources || !resources.length) {
        return { count: 0, transferSize: 0, top: [] };
      }
      var total = 0;
      var top = resources
        .slice()
        .sort(function (a, b) {
          return (b.transferSize || 0) - (a.transferSize || 0);
        })
        .slice(0, 5)
        .map(function (r) {
          return {
            name: r.name,
            type: r.initiatorType,
            transferSize: r.transferSize || 0,
            durationMs: Math.round(r.duration || 0)
          };
        });
      resources.forEach(function (r) {
        total += r.transferSize || 0;
      });
      return { count: resources.length, transferSize: total, top: top };
    } catch (e) {
      return { count: 0, transferSize: 0, top: [] };
    }
  }

  function getDomStats() {
    try {
      var nodes = document.getElementsByTagName('*').length;
      var images = document.images ? document.images.length : 0;
      var forms = document.forms ? document.forms.length : 0;
      return { nodes: nodes, images: images, forms: forms };
    } catch (e) {
      return { nodes: 0, images: 0, forms: 0 };
    }
  }

  function getNetStats() {
    var api = window.kbApi;
    if (!api || !api.state) {
      return null;
    }
    return {
      online: api.state.online,
      pendingCount: api.state.pendingCount,
      rttMs: api.state.rttMs,
      lastError: api.state.lastError
    };
  }

  function sampleHeap() {
    var mem = safeMemory();
    if (!mem) {
      return;
    }
    heapHistory.push({ at: Date.now(), used: mem.usedJSHeapSize });
    if (heapHistory.length > 60) {
      heapHistory.shift();
    }
  }

  function heapTrend() {
    if (heapHistory.length < 6) {
      return null;
    }
    var first = heapHistory[0];
    var last = heapHistory[heapHistory.length - 1];
    var dt = (last.at - first.at) / 1000;
    if (!dt) {
      return null;
    }
    var dUsed = last.used - first.used;
    return { seconds: Math.round(dt), deltaBytes: dUsed, bytesPerSecond: Math.round(dUsed / dt) };
  }

  function snapshot() {
    return {
      at: new Date().toISOString(),
      nav: getNavTiming(),
      resources: getResourceStats(),
      dom: getDomStats(),
      net: getNetStats(),
      memory: safeMemory(),
      longTasks: started ? longTasks : null,
      heapTrend: started ? heapTrend() : null
    };
  }

  function print() {
    var s = snapshot();
    // 控制台全景图：分组 + 关键指标
    try {
      console.groupCollapsed('[K-Book] 系统健康全景图 @ ' + s.at);
    } catch (e) {
      // ignore
    }
    try {
      if (s.nav) {
        console.log('导航:', s.nav);
      }
      console.log('资源:', {
        count: s.resources.count,
        transfer: formatBytes(s.resources.transferSize),
        top: s.resources.top.map(function (x) {
          return { size: formatBytes(x.transferSize), ms: x.durationMs, type: x.type, name: x.name };
        })
      });
      console.log('DOM:', s.dom);
      if (s.net) {
        console.log('网络:', s.net);
      }
      if (s.memory) {
        console.log('内存(Chrome):', {
          used: formatBytes(s.memory.usedJSHeapSize),
          total: formatBytes(s.memory.totalJSHeapSize),
          limit: formatBytes(s.memory.jsHeapSizeLimit)
        });
      } else {
        console.log('内存: 当前浏览器不支持 performance.memory');
      }
      if (s.longTasks) {
        console.log('长任务:', s.longTasks);
      }
      if (s.heapTrend) {
        console.log('内存趋势:', {
          seconds: s.heapTrend.seconds,
          delta: formatBytes(s.heapTrend.deltaBytes),
          bytesPerSecond: formatBytes(s.heapTrend.bytesPerSecond)
        });
      }
    } finally {
      try {
        console.groupEnd();
      } catch (e) {
        // ignore
      }
    }
    return s;
  }

  function start(intervalMs) {
    if (started) {
      return;
    }
    started = true;
    longTasks = { count: 0, totalMs: 0, lastAt: 0 };
    heapHistory = [];
    var ms = typeof intervalMs === 'number' && intervalMs > 0 ? intervalMs : 2000;
    if (typeof PerformanceObserver === 'function') {
      try {
        longTaskObserver = new PerformanceObserver(function (list) {
          var entries = list.getEntries();
          entries.forEach(function (entry) {
            longTasks.count += 1;
            longTasks.totalMs += entry.duration || 0;
            longTasks.lastAt = Date.now();
          });
        });
        // longtask 仅在支持时可用
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        longTaskObserver = null;
      }
    }
    timerId = window.setInterval(function () {
      sampleHeap();
    }, ms);
    sampleHeap();
  }

  function stop() {
    if (!started) {
      return;
    }
    started = false;
    if (timerId) {
      window.clearInterval(timerId);
      timerId = 0;
    }
    if (longTaskObserver && typeof longTaskObserver.disconnect === 'function') {
      try {
        longTaskObserver.disconnect();
      } catch (e) {
        // ignore
      }
    }
    longTaskObserver = null;
  }

  window.kbDiagnostics = {
    snapshot: snapshot,
    print: print,
    start: start,
    stop: stop
  };

  // 方便直接在控制台使用：kbHealth()
  window.kbHealth = function () {
    return window.kbDiagnostics.print();
  };
})(window, document);

