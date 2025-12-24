<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<script>
    window.__ctx = '${pageContext.request.contextPath}';
</script>
<script src="${ctx}/js/kb-api.js?v=${appVersion}"></script>
<script src="${ctx}/js/app.js?v=${appVersion}"></script>
<script src="${ctx}/js/my.js?v=${appVersion}"></script>
