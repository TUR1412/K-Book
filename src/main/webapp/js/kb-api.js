// @ts-check
/// <reference path="./kb-types.d.ts" />

(function (window, document) {
  'use strict';

  if (window.kbApi) {
    return;
  }

  var DEFAULT_TIMEOUT_MS = 10000;
  var MAX_TIMEOUT_MS = 25000;
  var SLOW_INDICATOR_DELAY_MS = 260;
  var HIDE_INDICATOR_DELAY_MS = 180;
  var RTT_ALPHA = 0.2;
  var DEFAULT_RTT_MS = 600;

  /** @type {Kb.NetState} */
  var state = {
    pendingCount: 0,
    online: navigator.onLine !== false,
    rttMs: DEFAULT_RTT_MS,
    lastError: '',
    lastUpdatedAt: Date.now()
  };

  /** @type {Kb.NetListener[]} */
  var listeners = [];

  /** @type {{onRequest: Kb.RequestInterceptor[], onResponse: Kb.ResponseInterceptor[], onError: Kb.ErrorInterceptor[]}} */
  var interceptors = {
    onRequest: [],
    onResponse: [],
    onError: []
  };

  /** @type {Record<string, Promise<any>>} */
  var inFlight = Object.create(null);

  var indicatorTimer = 0;
  var hideTimer = 0;

  function dispatchState() {
    state.lastUpdatedAt = Date.now();
    listeners.slice().forEach(function (fn) {
      try {
        fn(state);
      } catch (e) {
        // ignore
      }
    });
    try {
      document.dispatchEvent(new CustomEvent('kb:net:state', { detail: state }));
    } catch (e) {
      // ignore
    }
  }

  function setState(patch) {
    Object.keys(patch || {}).forEach(function (key) {
      state[key] = patch[key];
    });
    dispatchState();
  }

  function toast(message, type) {
    if (!message) {
      return;
    }
    if (window.kbToast) {
      window.kbToast(message, type || 'info');
      return;
    }
  }

  function getContextPath() {
    if (window.__ctx) {
      return window.__ctx;
    }
    var pathName = window.location.pathname || '';
    var idx = pathName.substr(1).indexOf('/');
    if (idx === -1) {
      return '';
    }
    return pathName.substring(0, idx + 1);
  }

  function resolveUrl(path) {
    var value = String(path || '');
    if (!value) {
      return '';
    }
    if (/^https?:\/\//i.test(value)) {
      return value;
    }
    var ctx = getContextPath();
    if (!ctx || ctx === '/') {
      return value.charAt(0) === '/' ? value : '/' + value;
    }
    if (value.indexOf(ctx + '/') === 0) {
      return value;
    }
    if (value.charAt(0) !== '/') {
      value = '/' + value;
    }
    return ctx + value;
  }

  function ensureNetIndicator() {
    var el = document.getElementById('kb-net-indicator');
    if (el) {
      return el;
    }
    el = document.createElement('div');
    el.id = 'kb-net-indicator';
    el.className = 'kb-net-indicator';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  }

  function showIndicator() {
    var el = ensureNetIndicator();
    el.classList.add('show');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('net-busy');
  }

  function hideIndicator() {
    var el = document.getElementById('kb-net-indicator');
    if (el) {
      el.classList.remove('show');
      el.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('net-busy');
  }

  function scheduleShow() {
    if (indicatorTimer) {
      return;
    }
    indicatorTimer = window.setTimeout(function () {
      indicatorTimer = 0;
      if (state.pendingCount > 0) {
        showIndicator();
      }
    }, SLOW_INDICATOR_DELAY_MS);
  }

  function scheduleHide() {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }
    hideTimer = window.setTimeout(function () {
      hideTimer = 0;
      if (state.pendingCount === 0) {
        hideIndicator();
      }
    }, HIDE_INDICATOR_DELAY_MS);
  }

  function effectiveTimeoutMs(requested) {
    if (typeof requested === 'number' && requested > 0) {
      return requested;
    }
    var rtt = typeof state.rttMs === 'number' && state.rttMs > 0 ? state.rttMs : DEFAULT_RTT_MS;
    var adaptive = Math.round(rtt * 8);
    var timeout = Math.max(DEFAULT_TIMEOUT_MS, adaptive);
    return Math.min(timeout, MAX_TIMEOUT_MS);
  }

  function updateRtt(elapsedMs) {
    if (!elapsedMs || elapsedMs < 0) {
      return;
    }
    var prev = typeof state.rttMs === 'number' && state.rttMs > 0 ? state.rttMs : DEFAULT_RTT_MS;
    var next = Math.round(prev * (1 - RTT_ALPHA) + elapsedMs * RTT_ALPHA);
    setState({ rttMs: next });
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function shouldRetry(method, attempt, maxRetries, error, status) {
    if (!maxRetries || attempt >= maxRetries) {
      return false;
    }
    var upper = String(method || '').toUpperCase();
    if (upper !== 'GET' && upper !== 'HEAD') {
      return false;
    }
    if (status && status >= 400 && status < 500 && status !== 408) {
      return false;
    }
    if (error && typeof error === 'object' && error.name === 'AbortError') {
      return true;
    }
    return true;
  }

  function calcRetryDelayMs(baseMs, attempt) {
    var base = typeof baseMs === 'number' && baseMs > 0 ? baseMs : 300;
    var exp = Math.min(6, attempt);
    var jitter = Math.floor(Math.random() * 80);
    return base * Math.pow(2, exp) + jitter;
  }

  function readCache(cacheKey, ttlMs) {
    if (!cacheKey) {
      return null;
    }
    var ttl = typeof ttlMs === 'number' && ttlMs > 0 ? ttlMs : 0;
    try {
      var raw = sessionStorage.getItem(cacheKey);
      if (!raw) {
        return null;
      }
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.ts !== 'number') {
        return null;
      }
      if (ttl && Date.now() - parsed.ts > ttl) {
        return null;
      }
      return parsed.data || null;
    } catch (e) {
      return null;
    }
  }

  function writeCache(cacheKey, payload) {
    if (!cacheKey) {
      return;
    }
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: payload }));
    } catch (e) {
      // ignore
    }
  }

  /** @param {Kb.InterceptorContext} ctx */
  function runRequestInterceptors(ctx) {
    interceptors.onRequest.forEach(function (fn) {
      try {
        fn(ctx);
      } catch (e) {
        // ignore
      }
    });
  }

  /** @param {Kb.InterceptorContext} ctx */
  function runResponseInterceptors(ctx, response) {
    interceptors.onResponse.forEach(function (fn) {
      try {
        fn(ctx, response);
      } catch (e) {
        // ignore
      }
    });
  }

  /** @param {Kb.InterceptorContext} ctx */
  function runErrorInterceptors(ctx, error) {
    interceptors.onError.forEach(function (fn) {
      try {
        fn(ctx, error);
      } catch (e) {
        // ignore
      }
    });
  }

  /**
   * @template T
   * @param {string} path
   * @param {Kb.RequestOptions=} requestOptions
   * @returns {Promise<Kb.ApiResponse<T>>}
   */
  function request(path, requestOptions) {
    var opts = requestOptions || {};
    var method = (opts.method || 'GET').toUpperCase();
    var resolvedUrl = resolveUrl(path);
    var expectJson = opts.expectJson !== false;
    var timeoutMs = effectiveTimeoutMs(opts.timeoutMs);
    var retries = typeof opts.retries === 'number' ? Math.max(0, opts.retries) : 0;
    var retryDelayMs = typeof opts.retryDelayMs === 'number' ? Math.max(0, opts.retryDelayMs) : 300;

    var headers = Object.assign(
      {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json'
      },
      opts.headers || {}
    );
    var csrfToken = window.__csrf;
    if (csrfToken && !headers['X-CSRF-Token'] && !headers['x-csrf-token']) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    /** @type {RequestInit} */
    var fetchOptions = {
      method: method,
      credentials: opts.credentials || 'same-origin',
      headers: headers
    };
    if (opts.body != null) {
      fetchOptions.body = opts.body;
    }

    var dedupeKey = opts.dedupeKey || (method === 'GET' ? method + ' ' + resolvedUrl : '');
    if (dedupeKey && inFlight[dedupeKey]) {
      return inFlight[dedupeKey];
    }

    if (method === 'GET' && opts.cacheKey) {
      var cached = readCache(opts.cacheKey, opts.cacheTtlMs);
      if (cached) {
        window.setTimeout(function () {
          request(path, Object.assign({}, opts, { cacheKey: null, dedupeKey: method + ' ' + resolvedUrl + '::revalidate' }))
            .then(function (fresh) {
              try {
                document.dispatchEvent(new CustomEvent('kb:cache:revalidated', { detail: { cacheKey: opts.cacheKey, data: fresh } }));
              } catch (e) {
                // ignore
              }
            })
            .catch(function () {
              // ignore revalidate errors
            });
        }, 0);
        return Promise.resolve(cached);
      }
    }

    var startedAt = Date.now();

    /** @type {Kb.InterceptorContext} */
    var interceptorCtx = {
      url: String(path || ''),
      resolvedUrl: resolvedUrl,
      options: fetchOptions,
      attempt: 0,
      startedAt: startedAt
    };
    runRequestInterceptors(interceptorCtx);

    var doFetch = function (attempt) {
      interceptorCtx.attempt = attempt;
      var controller = typeof AbortController === 'function' ? new AbortController() : null;
      if (controller) {
        fetchOptions.signal = controller.signal;
      }
      var timerId = 0;
      if (controller) {
        timerId = window.setTimeout(function () {
          try {
            controller.abort();
          } catch (e) {
            // ignore
          }
        }, timeoutMs);
      }

      var started = Date.now();

      return window
        .fetch(resolvedUrl, fetchOptions)
        .then(function (response) {
          if (timerId) {
            window.clearTimeout(timerId);
          }
          runResponseInterceptors(interceptorCtx, response);
          var contentType = response.headers && response.headers.get ? response.headers.get('content-type') : '';
          if (!response.ok) {
            if (expectJson && contentType && contentType.indexOf('application/json') !== -1) {
              return response.json().then(function (payload) {
                try {
                  payload.__httpStatus = response.status;
                } catch (e) {
                  // ignore
                }
                return payload;
              });
            }
            var err = new Error('HTTP ' + response.status);
            err.status = response.status;
            throw err;
          }
          if (!expectJson) {
            return response.text();
          }
          if (contentType && contentType.indexOf('application/json') === -1) {
            return response.text().then(function () {
              throw new Error('INVALID_CONTENT_TYPE');
            });
          }
          return response.json();
        })
        .then(function (payload) {
          updateRtt(Date.now() - started);
          if (method === 'GET' && opts.cacheKey && payload && payload.success === true) {
            writeCache(opts.cacheKey, payload);
          }
          return payload;
        })
        .catch(function (error) {
          if (timerId) {
            window.clearTimeout(timerId);
          }
          var status = error && typeof error === 'object' ? error.status : 0;
          if (shouldRetry(method, attempt, retries, error, status)) {
            return sleep(calcRetryDelayMs(retryDelayMs, attempt)).then(function () {
              return doFetch(attempt + 1);
            });
          }
          throw error;
        });
    };

    state.pendingCount += 1;
    setState({ pendingCount: state.pendingCount });
    scheduleShow();

    var promise = doFetch(0)
      .catch(function (error) {
        var msg = error && error.message ? String(error.message) : 'NETWORK_ERROR';
        setState({ lastError: msg });
        runErrorInterceptors(interceptorCtx, error);
        throw error;
      })
      .finally(function () {
        state.pendingCount = Math.max(0, state.pendingCount - 1);
        setState({ pendingCount: state.pendingCount });
        if (state.pendingCount === 0) {
          scheduleHide();
        }
      });

    if (dedupeKey) {
      inFlight[dedupeKey] = promise;
      promise.finally(function () {
        delete inFlight[dedupeKey];
      });
    }

    return promise;
  }

  /**
   * @template T
   * @param {string} path
   * @param {Omit<Kb.RequestOptions, 'method' | 'body'>=} options
   * @returns {Promise<Kb.ApiResponse<T>>}
   */
  function get(path, options) {
    return request(path, Object.assign({}, options || {}, { method: 'GET' }));
  }

  function serializeForm(form) {
    var params = new URLSearchParams();
    if (!form || !form.elements) {
      return params;
    }
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el || el.disabled || !el.name) {
        return;
      }
      var type = (el.type || '').toLowerCase();
      if ((type === 'checkbox' || type === 'radio') && !el.checked) {
        return;
      }
      params.append(el.name, el.value == null ? '' : String(el.value));
    });
    return params;
  }

  /**
   * @template T
   * @param {string} path
   * @param {HTMLFormElement} form
   * @param {Omit<Kb.RequestOptions, 'method' | 'body'>=} options
   * @returns {Promise<Kb.ApiResponse<T>>}
   */
  function postForm(path, form, options) {
    var body = serializeForm(form).toString();
    return request(path, Object.assign({}, options || {}, {
      method: 'POST',
      headers: Object.assign(
        {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        (options && options.headers) || {}
      ),
      body: body
    }));
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      return function () {};
    }
    listeners.push(listener);
    try {
      listener(state);
    } catch (e) {
      // ignore
    }
    return function () {
      var idx = listeners.indexOf(listener);
      if (idx >= 0) {
        listeners.splice(idx, 1);
      }
    };
  }

  function use(hooks) {
    if (!hooks) {
      return;
    }
    if (typeof hooks.onRequest === 'function') {
      interceptors.onRequest.push(hooks.onRequest);
    }
    if (typeof hooks.onResponse === 'function') {
      interceptors.onResponse.push(hooks.onResponse);
    }
    if (typeof hooks.onError === 'function') {
      interceptors.onError.push(hooks.onError);
    }
  }

  use({
    onError: function (_ctx, error) {
      var msg = error && error.message ? String(error.message) : '';
      if (msg === 'INVALID_CONTENT_TYPE') {
        toast('登录状态可能已过期，请刷新或重新登录。', 'info');
        return;
      }
      if (msg.indexOf('HTTP 401') === 0 || msg.indexOf('HTTP 403') === 0) {
        toast('无权限或登录已过期，请重新登录。', 'error');
      }
    }
  });

  function onOnlineChange() {
    var online = navigator.onLine !== false;
    setState({ online: online });
    if (!online) {
      toast('网络已离线：请求将排队或失败重试。', 'info');
    } else {
      toast('网络已恢复。', 'success');
    }
  }

  window.addEventListener('online', onOnlineChange);
  window.addEventListener('offline', onOnlineChange);

  /** @type {Kb.Api} */
  window.kbApi = {
    state: state,
    url: resolveUrl,
    subscribe: subscribe,
    use: use,
    request: request,
    get: get,
    postForm: postForm
  };
})(window, document);
