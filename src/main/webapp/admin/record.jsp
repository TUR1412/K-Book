<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<jsp:include page="/admin/_layout_top.jsp">
    <jsp:param name="pageTitle" value="借阅记录" />
    <jsp:param name="pageHint" value="追踪借阅历史与归还时间线" />
    <jsp:param name="activeNav" value="records" />
</jsp:include>

<div class="card">
    <div class="card-header">
        <div>
            <h3 class="card-title">检索条件</h3>
            <p class="card-subtitle">按借阅人或书名快速定位记录。</p>
        </div>
        <div class="card-header-actions">
            <span class="badge filter-count is-hidden" data-filter-count aria-live="polite">未筛选</span>
        </div>
    </div>
    <form action="${pageContext.request.contextPath}/record/searchRecords" method="post" class="filter-grid" data-persist-key="record-search">
        <c:if test="${USER_SESSION.role =='ADMIN'}">
            <div class="form-field">
                <label>借阅人</label>
                <input class="input" name="borrower" value="${search.borrower}" aria-label="借阅人"
                       maxlength="40" data-maxlength="40" data-count-target="count-record-borrower" aria-describedby="count-record-borrower"
                       data-normalize="true">
                <div class="input-meta">
                    <span class="char-count" id="count-record-borrower">0/40</span>
                </div>
            </div>
        </c:if>
        <div class="form-field">
            <label>图书名称</label>
            <input class="input" name="bookname" value="${search.bookname}" aria-label="图书名称"
                   maxlength="80" data-maxlength="80" data-count-target="count-record-bookname" aria-describedby="count-record-bookname"
                   data-normalize="true">
            <div class="input-meta">
                <span class="char-count" id="count-record-bookname">0/80</span>
            </div>
        </div>
        <div class="form-field">
            <div class="filter-actions">
                <button class="btn btn-ghost" type="submit">开始搜索</button>
                <button class="btn btn-outline" type="button" data-clear-form>清空条件</button>
            </div>
        </div>
    </form>
    <c:if test="${not empty search.borrower || not empty search.bookname}">
        <div class="filter-chips">
            <c:if test="${not empty search.borrower}">
                <span class="chip" data-field="borrower" title="点击清除此筛选" tabindex="0" role="button">借阅人：${search.borrower}</span>
            </c:if>
            <c:if test="${not empty search.bookname}">
                <span class="chip" data-field="bookname" title="点击清除此筛选" tabindex="0" role="button">书名：${search.bookname}</span>
            </c:if>
        </div>
    </c:if>
</div>

<div class="card">
    <div class="card-header">
        <div>
            <h3 class="card-title">借阅历史</h3>
            <p class="card-subtitle">完整记录借阅与归还时间。</p>
        </div>
        <div class="card-header-actions">
            <c:if test="${not empty pageResult}">
                <span class="badge">第 ${pageNum} 页 / 共 ${pageResult.total} 条</span>
            </c:if>
            <span class="badge badge-muted is-hidden" data-table-count aria-live="polite"></span>
            <button type="button" class="btn btn-outline btn-sm" data-export-table data-export-name="借阅记录">导出 CSV</button>
        </div>
    </div>
    <c:choose>
        <c:when test="${empty pageResult.rows}">
            <jsp:include page="/admin/_empty_state.jsp">
                <jsp:param name="title" value="暂时没有符合条件的记录" />
                <jsp:param name="desc" value="请调整筛选条件。" />
            </jsp:include>
        </c:when>
        <c:otherwise>
            <div class="table-scroll">
            <table class="data-table">
                <caption class="sr-only">借阅记录列表</caption>
                <thead>
                <tr>
                    <th scope="col">序号</th>
                    <th scope="col">借阅人</th>
                    <th scope="col">图书名称</th>
                    <th scope="col">标准ISBN</th>
                    <th scope="col">借阅时间</th>
                    <th scope="col">归还时间</th>
                </tr>
                </thead>
                <tbody>
                <c:forEach items="${pageResult.rows}" var="record" varStatus="status">
                    <tr class="${not empty USER_SESSION && USER_SESSION.name == record.borrower ? 'row-own' : ''}">
                        <td>${status.index + 1}</td>
                        <td>${record.borrower}</td>
                        <td>${record.bookname}</td>
                        <td><span class="isbn copyable" data-copy="${record.bookisbn}" title="点击复制 ISBN" aria-label="复制 ISBN ${record.bookisbn}" tabindex="0" role="button">${record.bookisbn}</span></td>
                        <td>${record.borrowTime}</td>
                        <td>${record.remandTime}</td>
                    </tr>
                </c:forEach>
                </tbody>
            </table>
            </div>
            <div id="pagination" class="pagination"></div>
        </c:otherwise>
    </c:choose>
</div>

<jsp:include page="/admin/_scripts.jsp" />
<script src="${pageContext.request.contextPath}/js/pagination.js?v=${appVersion}" defer></script>
<script nonce="${cspNonce}">
    pageargs.total = Math.ceil(${pageResult.total}/pageargs.pagesize);
    pageargs.cur = ${pageNum};
    pageargs.gourl = "${gourl}";
    recordVO.bookname = "${search.bookname}";
    recordVO.borrower = "${search.borrower}";
    pagination(pageargs);
</script>
<jsp:include page="/admin/_layout_bottom.jsp" />
