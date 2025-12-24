<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<jsp:include page="/admin/_layout_top.jsp">
    <jsp:param name="pageTitle" value="当前借阅" />
    <jsp:param name="pageHint" value="查看借阅中与归还中的图书" />
    <jsp:param name="activeNav" value="borrowed" />
</jsp:include>

<div class="card">
    <div class="card-header">
        <div>
            <h3 class="card-title">检索条件</h3>
            <p class="card-subtitle">快速定位借阅中的图书。</p>
        </div>
        <div class="card-header-actions">
            <span class="badge filter-count is-hidden" data-filter-count aria-live="polite">未筛选</span>
        </div>
    </div>
    <form action="${pageContext.request.contextPath}/book/searchBorrowed" method="post" class="filter-grid" data-persist-key="borrowed-search">
        <div class="form-field">
            <label>图书名称</label>
            <input class="input" name="name" value="${search.name}" aria-label="图书名称"
                   maxlength="80" data-maxlength="80" data-count-target="count-borrowed-name" aria-describedby="count-borrowed-name"
                   data-normalize="true">
            <div class="input-meta">
                <span class="char-count" id="count-borrowed-name">0/80</span>
            </div>
        </div>
        <div class="form-field">
            <label>图书作者</label>
            <input class="input" name="author" value="${search.author}" aria-label="图书作者"
                   maxlength="60" data-maxlength="60" data-count-target="count-borrowed-author" aria-describedby="count-borrowed-author"
                   data-normalize="true">
            <div class="input-meta">
                <span class="char-count" id="count-borrowed-author">0/60</span>
            </div>
        </div>
        <div class="form-field">
            <label>出版社</label>
            <input class="input" name="press" value="${search.press}" aria-label="出版社"
                   maxlength="80" data-maxlength="80" data-count-target="count-borrowed-press" aria-describedby="count-borrowed-press"
                   data-normalize="true">
            <div class="input-meta">
                <span class="char-count" id="count-borrowed-press">0/80</span>
            </div>
        </div>
        <div class="form-field">
            <div class="filter-actions">
                <button class="btn btn-ghost" type="submit">开始搜索</button>
                <button class="btn btn-outline" type="button" data-clear-form>清空条件</button>
            </div>
        </div>
    </form>
    <c:if test="${not empty search.name || not empty search.author || not empty search.press}">
        <div class="filter-chips">
            <c:if test="${not empty search.name}">
                <span class="chip" data-field="name" title="点击清除此筛选" tabindex="0" role="button">书名：${search.name}</span>
            </c:if>
            <c:if test="${not empty search.author}">
                <span class="chip" data-field="author" title="点击清除此筛选" tabindex="0" role="button">作者：${search.author}</span>
            </c:if>
            <c:if test="${not empty search.press}">
                <span class="chip" data-field="press" title="点击清除此筛选" tabindex="0" role="button">出版社：${search.press}</span>
            </c:if>
        </div>
    </c:if>
</div>

<div class="card">
    <div class="card-header">
        <div>
            <h3 class="card-title">借阅中图书</h3>
            <p class="card-subtitle">可直接归还或进行归还确认。</p>
        </div>
        <div class="card-header-actions">
            <c:if test="${not empty pageResult}">
                <span class="badge">第 ${pageNum} 页 / 共 ${pageResult.total} 条</span>
            </c:if>
            <span class="badge badge-muted is-hidden" data-table-count aria-live="polite"></span>
            <button type="button" class="btn btn-outline btn-sm" data-export-table data-export-name="借阅中列表">导出 CSV</button>
        </div>
    </div>
    <c:choose>
        <c:when test="${empty pageResult.rows}">
            <jsp:include page="/admin/_empty_state.jsp">
                <jsp:param name="title" value="暂无借阅中的图书" />
                <jsp:param name="desc" value="继续保持良好的借阅习惯。" />
            </jsp:include>
        </c:when>
        <c:otherwise>
            <div class="table-scroll">
            <table class="data-table">
                <caption class="sr-only">当前借阅列表</caption>
                <thead>
                <tr>
                    <th scope="col">序号</th>
                    <th scope="col">图书名称</th>
                    <th scope="col">图书作者</th>
                    <th scope="col">出版社</th>
                    <th scope="col">标准ISBN</th>
                    <th scope="col">书籍状态</th>
                    <th scope="col">借阅人</th>
                    <th scope="col">借阅时间</th>
                    <th scope="col">应归还时间</th>
                    <th scope="col" data-export="false">操作</th>
                </tr>
                </thead>
                <tbody>
                <c:forEach items="${pageResult.rows}" var="book" varStatus="status">
                    <tr class="${not empty USER_SESSION && USER_SESSION.name == book.borrower ? 'row-own' : ''}">
                        <td>${status.index + 1}</td>
                        <td>${book.name}</td>
                        <td>${book.author}</td>
                        <td>${book.press}</td>
                        <td><span class="isbn copyable" data-copy="${book.isbn}" title="点击复制 ISBN" aria-label="复制 ISBN ${book.isbn}" tabindex="0" role="button">${book.isbn}</span></td>
                        <td class="status-cell">
                            <c:if test="${book.status ==1}">
                                <span class="status-pill status-borrowed">借阅中</span>
                            </c:if>
                            <c:if test="${book.status ==2}">
                                <span class="status-pill status-returning">归还中</span>
                            </c:if>
                        </td>
                        <td>${book.borrower}</td>
                        <td>${book.borrowTime}</td>
                        <td>
                            <span class="due-date" data-date="${book.returnTime}" title="应归还日期：${book.returnTime}">${book.returnTime}</span>
                            <span class="due-badge" data-date="${book.returnTime}" title="剩余天数" aria-live="polite" aria-label="剩余天数"></span>
                        </td>
                        <td data-export="false">
                            <div class="table-actions">
                                <c:if test="${book.status ==1}">
                                    <button type="button" class="btn btn-sm btn-primary"
                                            data-kb-action="return-book" data-book-id="${book.id}">归还</button>
                                </c:if>
                                <c:if test="${book.status ==2}">
                                    <button type="button" class="btn btn-sm btn-outline" disabled="true">归还中</button>
                                    <c:if test="${USER_SESSION.role =='ADMIN'}">
                                        <button type="button" class="btn btn-sm btn-ghost"
                                                data-kb-action="return-confirm" data-book-id="${book.id}">归还确认</button>
                                    </c:if>
                                </c:if>
                            </div>
                        </td>
                    </tr>
                </c:forEach>
                </tbody>
            </table>
            </div>
            <div class="status-summary" data-status-summary aria-live="polite"></div>
            <div class="status-legend">
                <span class="status-pill status-borrowed">借阅中</span>
                <span class="status-pill status-returning">归还中</span>
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
    bookVO.name = "${search.name}";
    bookVO.author = "${search.author}";
    bookVO.press = "${search.press}";
    pagination(pageargs);
</script>
<jsp:include page="/admin/_layout_bottom.jsp" />
