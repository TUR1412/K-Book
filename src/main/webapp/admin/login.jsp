<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:set var="appVersion" value="20251220-17" />
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>云借阅 - 登录</title>
    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css/app.css?v=${appVersion}"/>
    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css/login.css?v=${appVersion}"/>
</head>
<body class="login-body">
<div class="login-shell">
    <div class="login-card">
        <div class="login-brand">
            <div class="brand-mark">K</div>
            <div>
                <h1 class="login-title">云借阅</h1>
                <p class="login-subtitle">图书管理系统 · 管理端</p>
            </div>
        </div>
        <c:if test="${not empty msg}">
            <div class="login-alert" role="alert">${msg}</div>
        </c:if>
        <form id="loginform" class="login-form" action="${pageContext.request.contextPath}/login" method="post">
            <input type="hidden" name="_csrf" value="${csrfToken}">
            <div class="form-field">
                <label for="login-email">用户名</label>
                <input id="login-email" type="text" placeholder="请输入账号或邮箱" class="input" name="email" autocomplete="username"
                       inputmode="email" autocapitalize="off" spellcheck="false" maxlength="80" required
                       data-normalize="true" data-lowercase="true">
            </div>
            <div class="form-field">
                <label for="login-password">密码</label>
                <input id="login-password" type="password" placeholder="请输入密码" class="input" name="password" autocomplete="current-password" maxlength="64" required>
            </div>
            <div class="caps-hint" id="caps-hint">大写锁定已开启，请注意大小写。</div>
            <label class="checkbox" for="togglePassword">
                <input type="checkbox" id="togglePassword" aria-controls="login-password">
                显示密码
            </label>
            <div class="login-actions">
                <button class="btn btn-primary" type="submit">登 录</button>
            </div>
        </form>
        <div class="login-footer">登录后即可进入图书借阅管理台。</div>
    </div>
    <div class="login-aside">
        <h3>更高效的借阅流程</h3>
        <div class="login-points">
            <span><i class="login-dot"></i>一键检索、快速借阅、自动提醒</span>
            <span><i class="login-dot"></i>实时同步借阅状态与归还进度</span>
            <span><i class="login-dot"></i>优雅的运营面板与数据视图</span>
        </div>
        <div class="login-footer">如遇登录问题，请联系系统管理员。</div>
    </div>
</div>
</body>
<script nonce="${cspNonce}">
    window.__ctx = '${pageContext.request.contextPath}';
    window.__csrf = '${csrfToken}';
</script>
<script src="${pageContext.request.contextPath}/js/kb-api.js?v=${appVersion}"></script>
<script src="${pageContext.request.contextPath}/js/app.js?v=${appVersion}"></script>
<script nonce="${cspNonce}" type="text/javascript">
    var _topWin = window;
    while (_topWin !== _topWin.parent.window) {
        _topWin = _topWin.parent.window;
    }
    if (window !== _topWin) {
        _topWin.document.location.href = '${pageContext.request.contextPath}/admin/login.jsp';
    }
</script>
</html>
