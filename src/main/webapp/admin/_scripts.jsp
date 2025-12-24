<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<script nonce="${cspNonce}">
    window.__ctx = '${pageContext.request.contextPath}';
    window.__csrf = '${csrfToken}';

    (function () {
        var loaded = {};

        function loadScriptOnce(key, src) {
            if (loaded[key]) {
                return loaded[key];
            }
            loaded[key] = new Promise(function (resolve, reject) {
                if (!src) {
                    resolve();
                    return;
                }
                var script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = function () { resolve(); };
                script.onerror = function () { reject(new Error('Failed to load ' + src)); };
                (document.head || document.documentElement).appendChild(script);
            });
            return loaded[key];
        }

        window.kbLoadDiagnostics = function () {
            if (window.kbDiagnostics) {
                return Promise.resolve();
            }
            return loadScriptOnce('kb-diagnostics', window.__ctx + '/js/kb-diagnostics.js?v=${appVersion}');
        };

        window.kbLoadVirtualScroll = function () {
            if (window.kbVirtualList) {
                return Promise.resolve();
            }
            return loadScriptOnce('kb-virtual-scroll', window.__ctx + '/js/kb-virtual-scroll.js?v=${appVersion}');
        };

        window.kbHealth = window.kbHealth || function () {
            return window.kbLoadDiagnostics().then(function () {
                if (window.kbDiagnostics && typeof window.kbDiagnostics.print === 'function') {
                    return window.kbDiagnostics.print();
                }
            });
        };

        try {
            var params = new URLSearchParams(window.location.search);
            if (params.get('kbDiagnostics') === '1') {
                window.kbLoadDiagnostics();
            }
        } catch (e) {}
    })();
</script>
<script src="${ctx}/js/kb-api.js?v=${appVersion}" defer></script>
<script src="${ctx}/js/app.js?v=${appVersion}" defer></script>
<script src="${ctx}/js/my.js?v=${appVersion}" defer></script>
