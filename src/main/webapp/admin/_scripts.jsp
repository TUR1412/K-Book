<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<script nonce="${cspNonce}">
    window.__ctx = '${pageContext.request.contextPath}';
    window.__csrf = '${csrfToken}';
</script>
<script src="${ctx}/js/kb-api.js?v=${appVersion}"></script>
<script src="${ctx}/js/kb-virtual-scroll.js?v=${appVersion}"></script>
<script src="${ctx}/js/kb-diagnostics.js?v=${appVersion}"></script>
<script src="${ctx}/js/app.js?v=${appVersion}"></script>
<script src="${ctx}/js/my.js?v=${appVersion}"></script>
