<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<c:set var="appVersion" value="20251220-17" scope="request" />
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${param.pageTitle} | 云借阅</title>
    <link rel="stylesheet" href="${ctx}/css/app.css?v=${appVersion}">
    <link rel="stylesheet" href="${ctx}/css/pagination.css?v=${appVersion}">
</head>
<body class="app-body" data-active="${param.activeNav}">
<a class="skip-link" href="#main-content">跳到内容</a>
<div class="app-layout">
    <aside class="app-sidebar">
        <div class="brand">
            <div class="brand-mark">K</div>
            <div class="brand-text">
                <span class="brand-title">K-Book</span>
                <span class="brand-subtitle">云借阅管理台</span>
            </div>
        </div>
        <nav class="nav">
            <a class="nav-item" data-key="dashboard" href="${ctx}/admin/main.jsp">
                <span class="nav-dot"></span>仪表盘
            </a>
            <a class="nav-item" data-key="new" href="${ctx}/book/selectNewbooks">
                <span class="nav-dot"></span>新书推荐
            </a>
            <a class="nav-item" data-key="books" href="${ctx}/book/search">
                <span class="nav-dot"></span>图书借阅
            </a>
            <a class="nav-item" data-key="borrowed" href="${ctx}/book/searchBorrowed">
                <span class="nav-dot"></span>当前借阅
            </a>
            <a class="nav-item" data-key="records" href="${ctx}/record/searchRecords">
                <span class="nav-dot"></span>借阅记录
            </a>
        </nav>
        <div class="sidebar-card">
            <div class="sidebar-card-title">今日提醒</div>
            <ul class="sidebar-list">
                <li><span></span>借阅后请及时确认归还进度</li>
                <li><span></span>快捷键：Alt + N 新增图书</li>
                <li><span></span>快捷键：Alt + R 清空筛选</li>
                <li><span></span>快捷键：Shift + / 查看帮助</li>
            </ul>
        </div>
    </aside>
    <main class="app-main" id="main-content">
        <header class="app-topbar">
            <div class="topbar-meta">
                <h1 class="page-title">${param.pageTitle}</h1>
                <p class="page-hint text-fade">${param.pageHint}</p>
            </div>
            <div class="topbar-actions">
                <button class="btn btn-outline btn-sm" type="button" id="density-toggle" aria-pressed="false" title="切换紧凑布局">
                    紧凑模式
                </button>
                <button class="btn btn-outline btn-sm" type="button" id="contrast-toggle" aria-pressed="false" title="切换高对比模式">
                    高对比
                </button>
                <button class="btn btn-outline btn-sm" type="button" id="theme-toggle" aria-pressed="false" title="切换主题（自动/暗黑/亮色）">
                    主题：自动
                </button>
                <button class="btn btn-outline btn-sm" type="button" id="help-toggle" aria-expanded="false" aria-controls="shortcut-panel" title="查看快捷键">
                    快捷键
                </button>
                <span class="topbar-time" id="topbar-time"></span>
                <div class="user-chip">
                    <div class="user-avatar">
                        <c:choose>
                            <c:when test="${not empty USER_SESSION}">
                                <c:out value="${fn:substring(USER_SESSION.name,0,1)}"/>
                            </c:when>
                            <c:otherwise>访</c:otherwise>
                        </c:choose>
                    </div>
                    <div class="user-meta">
                        <span>
                            <c:choose>
                                <c:when test="${not empty USER_SESSION}">
                                    <c:out value="${USER_SESSION.name}"/>
                                </c:when>
                                <c:otherwise>访客</c:otherwise>
                            </c:choose>
                        </span>
                        <span class="user-role">
                            <c:choose>
                                <c:when test="${USER_SESSION.role == 'ADMIN'}">管理员</c:when>
                                <c:when test="${USER_SESSION.role == 'USER'}">读者</c:when>
                                <c:otherwise>访客</c:otherwise>
                            </c:choose>
                        </span>
                    </div>
                    <c:choose>
                        <c:when test="${USER_SESSION.role == 'ADMIN'}">
                            <span class="role-badge role-admin">管理员</span>
                        </c:when>
                        <c:when test="${USER_SESSION.role == 'USER'}">
                            <span class="role-badge role-user">读者</span>
                        </c:when>
                        <c:otherwise>
                            <span class="role-badge role-guest">访客</span>
                        </c:otherwise>
                    </c:choose>
                </div>
                <form class="logout-form" action="${ctx}/logout" method="post" data-no-loading="true">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <button class="btn btn-ghost" type="submit">退出</button>
                </form>
            </div>
        </header>
        <section class="app-content">
