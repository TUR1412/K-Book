<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<jsp:include page="/admin/_layout_top.jsp">
    <jsp:param name="pageTitle" value="仪表盘" />
    <jsp:param name="pageHint" value="总览 · 快速入口 · 借阅引导" />
    <jsp:param name="activeNav" value="dashboard" />
</jsp:include>

<div class="bento">
    <section class="card bento-span-7">
        <div class="hero">
            <span class="badge">云借阅 · 指挥台</span>
            <h2 class="hero-title">
                欢迎回来，
                <c:choose>
                    <c:when test="${not empty USER_SESSION}">
                        <c:out value="${USER_SESSION.name}"/>
                    </c:when>
                    <c:otherwise>读者</c:otherwise>
                </c:choose>
            </h2>
            <p class="card-subtitle">集中查看馆藏状态、借阅进度与下一步动作。</p>
            <div class="hero-actions">
                <a class="btn btn-primary" href="${pageContext.request.contextPath}/book/search">开始借阅</a>
                <a class="btn btn-ghost" href="${pageContext.request.contextPath}/book/selectNewbooks">查看新书</a>
                <a class="btn btn-outline is-hidden" id="continue-link" href="#">继续上次页面</a>
            </div>
        </div>
    </section>

    <section class="card bento-span-5">
        <div class="card-header">
            <div>
                <h3 class="card-title">今日节奏</h3>
                <p class="card-subtitle">建议优先处理待归还与借阅确认。</p>
            </div>
            <div class="card-header-actions">
                <button class="btn btn-outline btn-sm" type="button" id="summary-refresh">刷新数据</button>
                <span class="badge badge-muted" id="summary-updated" aria-live="polite">未刷新</span>
            </div>
        </div>
        <div class="kpi-grid">
            <div class="kpi-item">
                <div class="kpi-label">待归还确认</div>
                <div class="kpi-value skeleton" data-kpi="returning" aria-live="polite">—</div>
            </div>
            <div class="kpi-item">
                <div class="kpi-label">借阅中图书</div>
                <div class="kpi-value skeleton" data-kpi="borrowed" aria-live="polite">—</div>
            </div>
            <div class="kpi-item">
                <div class="kpi-label">可借阅图书</div>
                <div class="kpi-value skeleton" data-kpi="available" aria-live="polite">—</div>
            </div>
        </div>
    </section>

    <section class="card bento-span-4">
        <h3 class="card-title">快速流程</h3>
        <p class="card-subtitle">从检索到借阅确认只需三步。</p>
        <div class="kpi-grid">
            <div class="kpi-item">1. 搜索图书并筛选条件</div>
            <div class="kpi-item">2. 选择归还日期并提交借阅</div>
            <div class="kpi-item">3. 到行政中心取书确认</div>
        </div>
    </section>

    <section class="card bento-span-4">
        <h3 class="card-title">本周重点</h3>
        <p class="card-subtitle">优化库存周转率与借阅体验。</p>
        <div class="kpi-grid">
            <div class="kpi-item">整理超期借阅清单</div>
            <div class="kpi-item">更新热门书籍推荐</div>
            <div class="kpi-item">核对借阅记录完整性</div>
        </div>
    </section>

    <section class="card bento-span-4">
        <h3 class="card-title">系统状态</h3>
        <p class="card-subtitle">保持良好运行，定期核查日志。</p>
        <div class="kpi-grid">
            <div class="kpi-item">数据库连接：待接入监控</div>
            <div class="kpi-item">拦截器状态：已配置</div>
            <div class="kpi-item">活跃馆藏：<span class="kpi-inline" data-kpi="active" aria-live="polite">—</span></div>
            <div class="kpi-item">静态资源：版本化已启用</div>
        </div>
    </section>
</div>

<jsp:include page="/admin/_scripts.jsp" />
<jsp:include page="/admin/_layout_bottom.jsp" />
