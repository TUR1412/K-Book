// @ts-check
/// <reference path="./kb-types.d.ts" />

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function safeStorage() {
    try {
      var testKey = '__kb_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return localStorage;
    } catch (e) {
      return null;
    }
  }

  var storage = safeStorage();

  function setActiveNav() {
    var active = document.body.getAttribute('data-active');
    if (!active) {
      return;
    }
    var item = document.querySelector('.nav-item[data-key=\"' + active + '\"]');
    if (item) {
      item.classList.add('active');
    }
  }

  function rememberNav() {
    var links = document.querySelectorAll('.nav-item[data-key]');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        if (storage) {
          storage.setItem('kb:lastRoute', link.getAttribute('href'));
        }
      });
    });
  }

  function showContinueLink() {
    var target = document.getElementById('continue-link');
    if (!target) {
      return;
    }
    var last = storage ? storage.getItem('kb:lastRoute') : null;
    if (!last || last.indexOf(window.location.pathname) >= 0) {
      target.classList.add('is-hidden');
      return;
    }
    target.href = last;
    target.classList.remove('is-hidden');
  }

  function toast(message, type) {
    var root = document.getElementById('toast-root');
    if (!root) {
      alert(message);
      return;
    }
    var node = document.createElement('div');
    node.className = 'toast ' + (type || 'info');
    node.textContent = message;
    root.appendChild(node);
    setTimeout(function () {
      node.style.opacity = '0';
      node.style.transform = 'translateY(8px)';
    }, 2200);
    setTimeout(function () {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }, 2600);
  }

  window.kbToast = toast;

  function applyReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    var items = document.querySelectorAll('.app-sidebar, .app-topbar, .card, .login-card, .login-aside');
    items.forEach(function (item, index) {
      item.classList.add('reveal');
      item.style.animationDelay = (index * 0.06) + 's';
    });
  }

  function persistForm(form) {
    var key = form.getAttribute('data-persist-key');
    if (!key) {
      return;
    }
    var storageKey = 'kb:form:' + key;
    var inputs = form.querySelectorAll('input[name], select[name], textarea[name]');

    var saved = storage ? storage.getItem(storageKey) : null;
    if (saved) {
      try {
        var data = JSON.parse(saved);
        inputs.forEach(function (input) {
          if (!input.value && data[input.name]) {
            input.value = data[input.name];
          }
        });
      } catch (e) {
        localStorage.removeItem(storageKey);
      }
    }

    var handler = function () {
      var payload = {};
      inputs.forEach(function (input) {
        if (input.value) {
          payload[input.name] = input.value;
        }
      });
      if (storage) {
        storage.setItem(storageKey, JSON.stringify(payload));
      }
      updateFilterState(form);
    };
    inputs.forEach(function (input) {
      input.addEventListener('change', handler);
      input.addEventListener('keyup', handler);
    });
    updateFilterState(form);
  }

  function hydratePersistedForms() {
    var forms = document.querySelectorAll('form[data-persist-key]');
    forms.forEach(function (form) {
      persistForm(form);
    });
  }

  function countActiveFilters(form) {
    var inputs = form.querySelectorAll('input[name], select[name], textarea[name]');
    var count = 0;
    inputs.forEach(function (input) {
      if (input.type === 'checkbox' || input.type === 'radio') {
        if (input.checked) {
          count += 1;
        }
        return;
      }
      if (input.value && input.value.trim() !== '') {
        count += 1;
      }
    });
    return count;
  }

  function updateFilterState(form) {
    if (!form) {
      return;
    }
    var count = countActiveFilters(form);
    var card = form.closest('.card');
    var badge = card ? card.querySelector('[data-filter-count]') : null;
    if (badge) {
      if (count > 0) {
        badge.textContent = '已筛选 ' + count + ' 项';
        badge.classList.remove('is-hidden');
      } else {
        badge.textContent = '未筛选';
        badge.classList.add('is-hidden');
      }
    }
    var clearButton = form.querySelector('[data-clear-form]');
    if (clearButton) {
      clearButton.disabled = count === 0;
      clearButton.setAttribute('aria-disabled', count === 0 ? 'true' : 'false');
    }
  }

  function bindFilterState() {
    var forms = document.querySelectorAll('form.filter-grid');
    forms.forEach(function (form) {
      updateFilterState(form);
      var handler = function () {
        updateFilterState(form);
      };
      form.addEventListener('input', handler);
      form.addEventListener('change', handler);
    });
  }

  function applyDensitySetting() {
    if (!storage) {
      return;
    }
    var density = storage.getItem('kb:density');
    if (density === 'compact') {
      document.body.classList.add('density-compact');
    }
    var toggle = document.getElementById('density-toggle');
    if (toggle) {
      var isCompact = document.body.classList.contains('density-compact');
      toggle.setAttribute('aria-pressed', isCompact ? 'true' : 'false');
      toggle.textContent = isCompact ? '舒展模式' : '紧凑模式';
    }
  }

  function bindDensityToggle() {
    var toggle = document.getElementById('density-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('density-compact');
      if (storage) {
        storage.setItem('kb:density', document.body.classList.contains('density-compact') ? 'compact' : 'default');
      }
      applyDensitySetting();
      if (window.kbToast) {
        window.kbToast(document.body.classList.contains('density-compact') ? '已切换至紧凑模式' : '已切换至舒展模式', 'info');
      }
    });
  }

  function applyContrastSetting() {
    if (!storage) {
      return;
    }
    var contrast = storage.getItem('kb:contrast');
    if (contrast === 'strong') {
      document.body.classList.add('contrast-strong');
    }
    var toggle = document.getElementById('contrast-toggle');
    if (toggle) {
      var isStrong = document.body.classList.contains('contrast-strong');
      toggle.setAttribute('aria-pressed', isStrong ? 'true' : 'false');
      toggle.textContent = isStrong ? '标准对比' : '高对比';
    }
  }

  function bindContrastToggle() {
    var toggle = document.getElementById('contrast-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('contrast-strong');
      if (storage) {
        storage.setItem('kb:contrast', document.body.classList.contains('contrast-strong') ? 'strong' : 'default');
      }
      applyContrastSetting();
      if (window.kbToast) {
        window.kbToast(document.body.classList.contains('contrast-strong') ? '已开启高对比' : '已恢复标准对比', 'info');
      }
    });
  }

  function bindQuickActions() {
    document.addEventListener('keydown', function (event) {
      if (!event.altKey || event.key.toLowerCase() !== 'n') {
        return;
      }
      var modal = document.getElementById('addOrEditModal');
      if (!modal) {
        return;
      }
      event.preventDefault();
      if (typeof window.resetBookForm === 'function') {
        window.resetBookForm();
      }
      openModal(modal);
    });
    document.addEventListener('keydown', function (event) {
      if (!event.altKey || event.key.toLowerCase() !== 'c') {
        return;
      }
      var toggle = document.getElementById('contrast-toggle');
      if (toggle) {
        event.preventDefault();
        toggle.click();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (!event.altKey || event.key.toLowerCase() !== 'r') {
        return;
      }
      var clear = document.querySelector('[data-clear-form]');
      if (clear) {
        event.preventDefault();
        clear.click();
      }
    });
  }

  function bindFormClear() {
    var buttons = document.querySelectorAll('[data-clear-form]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var form = button.closest('form');
        if (!form) {
          return;
        }
        var inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function (input) {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
          } else {
            input.value = '';
          }
        });
        var key = form.getAttribute('data-persist-key');
        if (storage && key) {
          storage.removeItem('kb:form:' + key);
        }
        updateFilterState(form);
        if (window.kbToast) {
          window.kbToast('已清空筛选条件', 'info');
        }
      });
    });
  }

  function bindScrollTop() {
    var button = document.getElementById('scroll-top');
    if (!button) {
      return;
    }
    var toggle = function () {
      if (window.scrollY > 280) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function bindTopbarShadow() {
    var topbar = document.querySelector('.app-topbar');
    if (!topbar) {
      return;
    }
    var onScroll = function () {
      if (window.scrollY > 8) {
        topbar.classList.add('scrolled');
      } else {
        topbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function bindSearchFocus() {
    document.addEventListener('keydown', function (event) {
      var isSlash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey;
      var isCmdK = (event.key && event.key.toLowerCase() === 'k') && (event.ctrlKey || event.metaKey);
      if (!isSlash && !isCmdK) {
        return;
      }
      var active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        return;
      }
      var input = document.querySelector('.filter-grid input');
      if (input) {
        event.preventDefault();
        input.focus();
      }
    });
  }

  function bindScrollRestore() {
    if (!storage) {
      return;
    }
    var key = 'kb:scroll:' + window.location.pathname;
    var saved = storage.getItem(key);
    if (saved) {
      setTimeout(function () {
        window.scrollTo(0, parseInt(saved, 10) || 0);
      }, 0);
    }
    window.addEventListener('beforeunload', function () {
      storage.setItem(key, window.scrollY.toString());
    });
  }

  function bindTopbarTime() {
    var node = document.getElementById('topbar-time');
    if (!node) {
      return;
    }
    var update = function () {
      var now = new Date();
      var hours = String(now.getHours()).padStart(2, '0');
      var minutes = String(now.getMinutes()).padStart(2, '0');
      node.textContent = '本地时间 ' + hours + ':' + minutes;
    };
    update();
    setInterval(update, 60000);
  }

  function bindDashboardSummary() {
    var nodes = document.querySelectorAll('[data-kpi]');
    if (!nodes.length) {
      return;
    }
    var ctx = window.__ctx || '';
    var cacheKey = 'kb:summary';
    var refreshBtn = document.getElementById('summary-refresh');
    var updatedNode = document.getElementById('summary-updated');
    var refreshText = refreshBtn ? refreshBtn.textContent : '';
    var formatTime = function (date) {
      var hours = String(date.getHours()).padStart(2, '0');
      var minutes = String(date.getMinutes()).padStart(2, '0');
      return hours + ':' + minutes;
    };
    var setRefreshing = function (state) {
      if (!refreshBtn) {
        return;
      }
      refreshBtn.disabled = state;
      refreshBtn.classList.toggle('is-loading', state);
      refreshBtn.textContent = state ? '刷新中…' : (refreshText || '刷新数据');
      refreshBtn.setAttribute('aria-busy', state ? 'true' : 'false');
    };
    var setUpdated = function () {
      if (!updatedNode) {
        return;
      }
      updatedNode.textContent = '更新于 ' + formatTime(new Date());
    };
    var applyData = function (data) {
      nodes.forEach(function (node) {
        var key = node.getAttribute('data-kpi');
        var value = data && data[key] !== undefined ? data[key] : '—';
        node.textContent = value;
        if (value !== '—') {
          node.setAttribute('title', '当前数量：' + value);
        }
        node.classList.remove('skeleton');
      });
      setUpdated();
    };
    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        var cachedData = JSON.parse(cached);
        applyData(cachedData.data || {});
      }
    } catch (e) {
      // ignore cache errors
    }
    var onSuccess = function (payload) {
      if (!payload || payload.success !== true) {
        if (window.kbToast) {
          window.kbToast((payload && payload.message) || '获取摘要失败', 'error');
        }
        setRefreshing(false);
        return;
      }
      applyData(payload.data || {});
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: payload.data || {}, ts: Date.now() }));
      } catch (e) {
        // ignore cache write errors
      }
      setRefreshing(false);
    };
    var requestSummary = function () {
      setRefreshing(true);
      var api = window.kbApi;
      if (api && typeof api.get === 'function') {
        api
          .get('/book/summary', { credentials: 'same-origin', retries: 1 })
          .then(onSuccess)
          .catch(function () {
            if (window.kbToast) {
              window.kbToast('获取摘要失败，请稍后重试。', 'error');
            }
            setRefreshing(false);
          });
        return;
      }
      if (window.fetch) {
        fetch(ctx + '/book/summary', { credentials: 'same-origin' })
          .then(function (res) { return res.json(); })
          .then(onSuccess)
          .catch(function () {
            if (window.kbToast) {
              window.kbToast('获取摘要失败，请稍后重试。', 'error');
            }
            setRefreshing(false);
          });
        return;
      }
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', ctx + '/book/summary', true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) {
            return;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              onSuccess(JSON.parse(xhr.responseText));
            } catch (e) {
              // ignore parse errors
              setRefreshing(false);
            }
          } else {
            setRefreshing(false);
          }
        };
        xhr.send();
      } catch (e) {
        // ignore xhr errors
        setRefreshing(false);
      }
    };
    requestSummary();
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        requestSummary();
        if (window.kbToast) {
          window.kbToast('正在刷新仪表盘数据', 'info');
        }
      });
    }
  }

  function bindHelpOverlay() {
    var panel = document.getElementById('shortcut-panel');
    var toggle = document.getElementById('help-toggle');
    if (!panel || !toggle) {
      return;
    }
    var focusable = function () {
      return panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    };
    var close = function () {
      if (!panel.classList.contains('show')) {
        return;
      }
      panel.classList.remove('show');
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    };
    var open = function () {
      panel.classList.add('show');
      panel.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      var items = focusable();
      if (items.length) {
        items[0].focus();
      }
    };
    toggle.addEventListener('click', function () {
      if (panel.classList.contains('show')) {
        close();
      } else {
        open();
      }
    });
    panel.addEventListener('click', function (event) {
      if (event.target === panel) {
        close();
      }
    });
    var closeBtn = panel.querySelector('[data-help-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        close();
      });
    }
    document.addEventListener('keydown', function (event) {
      var tag = event.target && event.target.tagName;
      var isInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if ((event.key === '?' || (event.key === '/' && event.shiftKey)) && !event.ctrlKey && !event.metaKey && !event.altKey && !isInput) {
        event.preventDefault();
        open();
      }
      if (event.key === 'Escape') {
        close();
      }
    });

    panel.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || !panel.classList.contains('show')) {
        return;
      }
      var items = focusable();
      if (!items.length) {
        return;
      }
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function bindLoginAlert() {
    var alertNode = document.querySelector('.login-alert');
    if (!alertNode) {
      return;
    }
    setTimeout(function () {
      alertNode.classList.add('fade-out');
    }, 3200);
    setTimeout(function () {
      if (alertNode.parentNode) {
        alertNode.parentNode.removeChild(alertNode);
      }
    }, 3800);
  }

  function bindLoginRemember() {
    if (!storage) {
      return;
    }
    var input = document.querySelector('input[name="email"]');
    if (!input) {
      return;
    }
    var saved = storage.getItem('kb:login:email');
    if (saved && !input.value) {
      input.value = saved;
    }
    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function () {
        if (input.value) {
          storage.setItem('kb:login:email', input.value.trim());
        }
      });
    }
  }

  function bindCharCount() {
    var fields = document.querySelectorAll('[data-maxlength]');
    if (!fields.length) {
      return;
    }
    fields.forEach(function (field) {
      var max = parseInt(field.getAttribute('data-maxlength'), 10);
      if (!max) {
        return;
      }
      var targetId = field.getAttribute('data-count-target');
      var counter = targetId ? document.getElementById(targetId) : field.parentNode.querySelector('.char-count');
      if (!counter) {
        return;
      }
      var update = function () {
        var length = field.value ? field.value.length : 0;
        counter.textContent = length + '/' + max;
        counter.classList.toggle('over', length > max);
      };
      field.addEventListener('input', update);
      update();
    });
  }

  function normalizeWhitespace(value) {
    return value.replace(/\s+/g, ' ').trim();
  }

  function sanitizeField(field) {
    if (!field || field.readOnly || field.disabled) {
      return;
    }
    var value = field.value || '';
    var maxLength = parseInt(field.getAttribute('maxlength') || field.getAttribute('data-maxlength'), 10);
    var isDecimal = field.hasAttribute('data-decimal');
    if (isDecimal) {
      value = value.replace(/[^0-9.]/g, '');
      var parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
    }
    if (field.hasAttribute('data-digits-only') && !isDecimal) {
      value = value.replace(/\D/g, '');
    }
    if (field.hasAttribute('data-normalize')) {
      value = normalizeWhitespace(value);
    }
    if (field.hasAttribute('data-lowercase')) {
      value = value.toLowerCase();
    }
    if (maxLength && value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    if (value !== field.value) {
      field.value = value;
    }
  }

  function bindInputSanitize() {
    var fields = document.querySelectorAll('[data-normalize], [data-digits-only], [data-lowercase], [data-decimal]');
    if (!fields.length) {
      return;
    }
    fields.forEach(function (field) {
      var handler = function () {
        sanitizeField(field);
      };
      field.addEventListener('blur', handler);
      field.addEventListener('change', handler);
      if (field.hasAttribute('data-digits-only') || field.hasAttribute('data-decimal')) {
        field.addEventListener('input', handler);
      }
    });
  }

  function setPageLoading(state) {
    var overlay = document.getElementById('page-loading');
    if (!overlay) {
      return;
    }
    if (state) {
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-loading');
    } else {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-loading');
    }
  }

  function bindPageLoading() {
    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || form.getAttribute('data-no-loading') === 'true') {
        return;
      }
      setPageLoading(true);
    });
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (!link) {
        return;
      }
      if (link.target === '_blank' || link.getAttribute('data-no-loading') === 'true') {
        return;
      }
      var href = link.getAttribute('href');
      if (!href || href.indexOf('javascript:') === 0 || href.charAt(0) === '#') {
        return;
      }
      setPageLoading(true);
    });
    window.addEventListener('pageshow', function () {
      setPageLoading(false);
    });
  }

  function focusFirstField(container) {
    if (!container) {
      return;
    }
    var input = container.querySelector('input:not([type="hidden"]), select, textarea, button');
    if (input) {
      input.focus();
    }
  }

  function getFocusable(container) {
    if (!container) {
      return [];
    }
    return Array.prototype.slice.call(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(function (node) {
        if (!node) {
          return false;
        }
        if (node.disabled) {
          return false;
        }
        if (node.getAttribute('aria-hidden') === 'true') {
          return false;
        }
        if (node.tabIndex < 0) {
          return false;
        }
        return true;
      });
  }

  function isModalOpen(modal) {
    return !!(modal && modal.classList && modal.classList.contains('is-open'));
  }

  function updateBodyModalState() {
    var open = document.querySelector('.modal.is-open');
    if (open) {
      document.body.classList.add('is-modal-open');
    } else {
      document.body.classList.remove('is-modal-open');
    }
  }

  function closeModal(modal, opts) {
    if (!modal || !isModalOpen(modal)) {
      return;
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    updateBodyModalState();

    var options = opts || {};
    if (options.restoreFocus !== false) {
      var prev = modal.__kbReturnFocus;
      if (prev && typeof prev.focus === 'function') {
        try {
          prev.focus();
        } catch (e) {
          // ignore focus errors
        }
      }
    }
    modal.__kbReturnFocus = null;
  }

  function openModal(modal) {
    if (!modal || isModalOpen(modal)) {
      return;
    }
    modal.__kbReturnFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    updateBodyModalState();

    setTimeout(function () {
      focusFirstField(modal);
    }, 0);
  }

  function findModalFromTrigger(trigger) {
    if (!trigger) {
      return null;
    }
    var target = trigger.getAttribute('data-target') || trigger.getAttribute('href');
    if (!target || target.charAt(0) !== '#') {
      return null;
    }
    return document.querySelector(target);
  }

  function getTopOpenModal() {
    var open = document.querySelectorAll('.modal.is-open');
    if (!open.length) {
      return null;
    }
    return open[open.length - 1];
  }

  function bindModals() {
    document.addEventListener('click', function (event) {
      var openTrigger = event.target.closest('[data-toggle="modal"][data-target]');
      if (openTrigger) {
        var modal = findModalFromTrigger(openTrigger);
        if (modal) {
          event.preventDefault();
          openModal(modal);
        }
        return;
      }

      var closeTrigger = event.target.closest('[data-dismiss="modal"]');
      if (closeTrigger) {
        var owner = closeTrigger.closest('.modal');
        if (owner) {
          event.preventDefault();
          closeModal(owner);
        }
        return;
      }

      var overlay = event.target;
      if (overlay && overlay.classList && overlay.classList.contains('modal') && isModalOpen(overlay)) {
        closeModal(overlay);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        var top = getTopOpenModal();
        if (top) {
          event.preventDefault();
          closeModal(top);
        }
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }
      var modal = getTopOpenModal();
      if (!modal || !modal.contains(document.activeElement)) {
        return;
      }
      var items = getFocusable(modal);
      if (!items.length) {
        return;
      }
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function bindSubmitGuard() {
    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || form.getAttribute('data-allow-multi') === 'true') {
        return;
      }
      var buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      buttons.forEach(function (button) {
        if (button.disabled) {
          return;
        }
        button.disabled = true;
        button.classList.add('is-loading');
        button.setAttribute('aria-busy', 'true');
      });
    });
  }

  function bindCopy() {
    var items = document.querySelectorAll('[data-copy]');
    if (!items.length) {
      return;
    }
    var fallbackCopy = function (text) {
      var temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        // ignore
      }
      document.body.removeChild(temp);
    };
    items.forEach(function (item) {
      var doCopy = function () {
        var text = item.getAttribute('data-copy');
        if (!text) {
          return;
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).catch(function () {
            fallbackCopy(text);
          });
        } else {
          fallbackCopy(text);
        }
        item.classList.add('copied');
        setTimeout(function () {
          item.classList.remove('copied');
        }, 900);
        if (window.kbToast) {
          window.kbToast('已复制：' + text, 'success');
        }
      };
      item.addEventListener('click', doCopy);
      item.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          doCopy();
        }
      });
    });
  }

  function bindTableCount() {
    var nodes = document.querySelectorAll('[data-table-count]');
    if (!nodes.length) {
      return;
    }
    nodes.forEach(function (node) {
      var card = node.closest('.card');
      var table = card ? card.querySelector('table') : null;
      if (!table) {
        node.textContent = '';
        node.classList.add('is-hidden');
        return;
      }
      var rows = table.querySelectorAll('tbody tr');
      var count = rows.length;
      if (count <= 0) {
        node.textContent = '';
        node.classList.add('is-hidden');
        return;
      }
      node.textContent = '本页 ' + count + ' 条';
      node.classList.remove('is-hidden');
    });
  }

  function sanitizeFileName(value) {
    return value.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_').replace(/_{2,}/g, '_');
  }

  function buildCsv(table) {
    var rows = [];
    var head = table.querySelectorAll('thead tr');
    var body = table.querySelectorAll('tbody tr');
    var extract = function (row) {
      var cells = row.querySelectorAll('th, td');
      var line = [];
      cells.forEach(function (cell) {
        if (cell.getAttribute('data-export') === 'false') {
          return;
        }
        var text = cell.textContent || '';
        var cleaned = normalizeWhitespace(text);
        if (cleaned.indexOf('"') >= 0 || cleaned.indexOf(',') >= 0 || cleaned.indexOf('\n') >= 0) {
          cleaned = '"' + cleaned.replace(/"/g, '""') + '"';
        }
        line.push(cleaned);
      });
      if (line.length) {
        rows.push(line.join(','));
      }
    };
    head.forEach(extract);
    body.forEach(extract);
    if (!rows.length) {
      return '';
    }
    return '\ufeff' + rows.join('\n');
  }

  function resolveExportTable(button) {
    if (!button) {
      return null;
    }
    var card = button.closest('.card');
    var target = button.getAttribute('data-export-target');
    if (target) {
      return document.querySelector(target);
    }
    if (card) {
      return card.querySelector('table');
    }
    return null;
  }

  function bindExportAvailability() {
    var buttons = document.querySelectorAll('[data-export-table]');
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (button) {
      var table = resolveExportTable(button);
      var rows = table ? table.querySelectorAll('tbody tr') : [];
      var hasRows = rows.length > 0;
      button.disabled = !hasRows;
      button.setAttribute('aria-disabled', hasRows ? 'false' : 'true');
      if (!hasRows && !button.getAttribute('title')) {
        button.setAttribute('title', '暂无数据可导出');
      }
    });
  }

  function bindTableExport() {
    var buttons = document.querySelectorAll('[data-export-table]');
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var table = resolveExportTable(button);
        if (!table) {
          if (window.kbToast) {
            window.kbToast('未找到可导出的表格。', 'error');
          }
          return;
        }
        var csv = buildCsv(table);
        if (!csv) {
          if (window.kbToast) {
            window.kbToast('暂无数据可导出。', 'info');
          }
          return;
        }
        var baseName = button.getAttribute('data-export-name') || 'K-Book';
        var now = new Date();
        var stamp = now.getFullYear().toString()
          + String(now.getMonth() + 1).padStart(2, '0')
          + String(now.getDate()).padStart(2, '0')
          + '_'
          + String(now.getHours()).padStart(2, '0')
          + String(now.getMinutes()).padStart(2, '0');
        var fileName = sanitizeFileName(baseName) + '_' + stamp + '.csv';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () {
          URL.revokeObjectURL(link.href);
        }, 0);
        if (window.kbToast) {
          window.kbToast('已导出 CSV：' + fileName, 'success');
        }
      });
    });
  }

  function bindPasswordToggle() {
    var toggle = document.getElementById('togglePassword');
    var input = document.querySelector('input[name=\"password\"]');
    if (!toggle || !input) {
      return;
    }
    toggle.addEventListener('change', function () {
      input.type = toggle.checked ? 'text' : 'password';
    });
  }

  function bindCapsWarning() {
    var input = document.querySelector('input[name="password"]');
    var hint = document.getElementById('caps-hint');
    if (!input || !hint) {
      return;
    }
    var handler = function (event) {
      if (event.getModifierState && event.getModifierState('CapsLock')) {
        hint.classList.add('show');
      } else {
        hint.classList.remove('show');
      }
    };
    input.addEventListener('keyup', handler);
    input.addEventListener('keydown', handler);
    input.addEventListener('blur', function () {
      hint.classList.remove('show');
    });
  }

  function bindChipClear() {
    var chips = document.querySelectorAll('.chip[data-field]');
    if (!chips.length) {
      return;
    }
    chips.forEach(function (chip) {
      var clearField = function () {
        var field = chip.getAttribute('data-field');
        var card = chip.closest('.card');
        if (!field || !card) {
          return;
        }
        var form = card.querySelector('form');
        if (!form) {
          return;
        }
        var input = form.querySelector('[name=\"' + field + '\"]');
        if (input) {
          input.value = '';
        }
        var key = form.getAttribute('data-persist-key');
        if (storage && key) {
          try {
            var raw = storage.getItem('kb:form:' + key);
            var data = raw ? JSON.parse(raw) : {};
            delete data[field];
            storage.setItem('kb:form:' + key, JSON.stringify(data));
          } catch (e) {
            storage.removeItem('kb:form:' + key);
          }
        }
        form.submit();
      };
      chip.addEventListener('click', clearField);
      chip.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          clearField();
        }
      });
    });
  }

  function bindDueBadges() {
    var badges = document.querySelectorAll('.due-badge[data-date]');
    if (!badges.length) {
      return;
    }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    badges.forEach(function (badge) {
      var raw = badge.getAttribute('data-date');
      if (!raw) {
        badge.textContent = '';
        badge.style.display = 'none';
        return;
      }
      var date = new Date(raw + 'T00:00:00');
      if (Number.isNaN(date.getTime())) {
        badge.textContent = '';
        badge.style.display = 'none';
        return;
      }
      var diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      if (diff < 0) {
        badge.textContent = '已逾期 ' + Math.abs(diff) + ' 天';
        badge.setAttribute('aria-label', badge.textContent);
        badge.classList.add('overdue');
        var row = badge.closest('tr');
        if (row) {
          row.classList.add('row-overdue');
        }
        return;
      }
      if (diff === 0) {
        badge.textContent = '今天到期';
        badge.setAttribute('aria-label', badge.textContent);
        var todayRow = badge.closest('tr');
        if (todayRow) {
          todayRow.classList.add('row-due-soon');
        }
        return;
      }
      if (diff <= 3) {
        var soonRow = badge.closest('tr');
        if (soonRow) {
          soonRow.classList.add('row-due-soon');
        }
      }
      badge.textContent = '剩余 ' + diff + ' 天';
      badge.setAttribute('aria-label', badge.textContent);
    });
  }

  function bindStatusSummary() {
    var summaries = document.querySelectorAll('[data-status-summary]');
    summaries.forEach(function (summary) {
      var card = summary.closest('.card');
      if (!card) {
        return;
      }
      var table = card.querySelector('table');
      if (!table) {
        summary.textContent = '';
        return;
      }
      var pills = table.querySelectorAll('tbody .status-pill');
      var counts = {
        available: 0,
        borrowed: 0,
        returning: 0,
        offline: 0
      };
      pills.forEach(function (pill) {
        if (pill.classList.contains('status-available')) {
          counts.available += 1;
        } else if (pill.classList.contains('status-borrowed')) {
          counts.borrowed += 1;
        } else if (pill.classList.contains('status-returning')) {
          counts.returning += 1;
        } else if (pill.classList.contains('status-offline')) {
          counts.offline += 1;
        }
      });
      var fragments = [];
      if (counts.available) {
        fragments.push('<span class="badge">可借阅 ' + counts.available + '</span>');
      }
      if (counts.borrowed) {
        fragments.push('<span class="badge">借阅中 ' + counts.borrowed + '</span>');
      }
      if (counts.returning) {
        fragments.push('<span class="badge">归还中 ' + counts.returning + '</span>');
      }
      if (counts.offline) {
        fragments.push('<span class="badge">已下架 ' + counts.offline + '</span>');
      }
      summary.innerHTML = fragments.join('');
      if (!fragments.length) {
        summary.textContent = '';
      }
    });
  }

  ready(function () {
    setActiveNav();
    rememberNav();
    showContinueLink();
    if (document.body.getAttribute('data-active')) {
      if (storage) {
        storage.setItem('kb:lastRoute', window.location.pathname);
      }
    }
    applyReveal();
    hydratePersistedForms();
    bindFilterState();
    applyDensitySetting();
    bindDensityToggle();
    applyContrastSetting();
    bindContrastToggle();
    bindQuickActions();
    bindFormClear();
    bindScrollTop();
    bindTopbarShadow();
    bindCopy();
    bindPasswordToggle();
    bindCapsWarning();
    bindChipClear();
    bindSearchFocus();
    bindScrollRestore();
    bindTopbarTime();
    bindPageLoading();
    bindDashboardSummary();
    bindHelpOverlay();
    bindLoginAlert();
    bindLoginRemember();
    bindCharCount();
    bindInputSanitize();
    bindSubmitGuard();
    bindDueBadges();
    bindStatusSummary();
    bindTableCount();
    bindExportAvailability();
    bindTableExport();
    bindModals();
  });
})();
