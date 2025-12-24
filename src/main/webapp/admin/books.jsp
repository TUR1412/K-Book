<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<jsp:include page="/admin/_layout_top.jsp">
    <jsp:param name="pageTitle" value="图书借阅" />
    <jsp:param name="pageHint" value="搜索、借阅与馆藏维护" />
    <jsp:param name="activeNav" value="books" />
</jsp:include>

<div class="card">
    <div class="card-header">
        <div>
            <h3 class="card-title">检索条件</h3>
            <p class="card-subtitle">支持按书名、作者与出版社联合筛选。</p>
        </div>
        <div class="card-header-actions">
            <span class="badge filter-count is-hidden" data-filter-count aria-live="polite">未筛选</span>
            <c:if test="${USER_SESSION.role =='ADMIN'}">
                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#addOrEditModal"
                        data-kb-action="new-book">新增图书</button>
                <span class="badge">快捷键 Alt + N</span>
            </c:if>
        </div>
    </div>
    <form action="${pageContext.request.contextPath}/book/search" method="post" class="filter-grid" data-persist-key="books-search">
        <div class="form-field">
            <label>图书名称</label>
            <input class="input" name="name" value="${search.name}" placeholder="例如：设计心理学" aria-label="图书名称"
                   maxlength="80" data-maxlength="80" data-count-target="count-books-name" aria-describedby="count-books-name"
                   data-normalize="true">
            <div class="input-meta">
                <span class="char-count" id="count-books-name">0/80</span>
            </div>
        </div>
        <div class="form-field">
            <label>图书作者</label>
            <input class="input" name="author" value="${search.author}" placeholder="例如：唐纳德·诺曼" aria-label="图书作者"
                   maxlength="60" data-maxlength="60" data-count-target="count-books-author" aria-describedby="count-books-author"
                   data-normalize="true">
            <div class="input-meta">
                <span class="char-count" id="count-books-author">0/60</span>
            </div>
        </div>
        <div class="form-field">
            <label>出版社</label>
            <input class="input" name="press" value="${search.press}" placeholder="例如：中信出版社" aria-label="出版社"
                   maxlength="80" data-maxlength="80" data-count-target="count-books-press" aria-describedby="count-books-press"
                   data-normalize="true">
            <div class="input-meta">
                <span class="char-count" id="count-books-press">0/80</span>
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
            <h3 class="card-title">借阅列表</h3>
            <p class="card-subtitle">实时查看可借阅与借阅中的图书。</p>
        </div>
        <div class="card-header-actions">
            <c:if test="${not empty pageResult}">
                <span class="badge">第 ${pageNum} 页 / 共 ${pageResult.total} 条</span>
            </c:if>
            <span class="badge badge-muted is-hidden" data-table-count aria-live="polite"></span>
            <button type="button" class="btn btn-outline btn-sm" data-export-table data-export-name="借阅列表">导出 CSV</button>
        </div>
    </div>

    <c:choose>
        <c:when test="${empty pageResult.rows}">
            <jsp:include page="/admin/_empty_state.jsp">
                <jsp:param name="title" value="暂时没有匹配的图书记录" />
                <jsp:param name="desc" value="尝试放宽搜索条件或新增馆藏。" />
            </jsp:include>
            <c:if test="${USER_SESSION.role =='ADMIN'}">
                <div class="empty-actions">
                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#addOrEditModal"
                            data-kb-action="new-book">新增图书</button>
                </div>
            </c:if>
        </c:when>
        <c:otherwise>
            <div class="table-scroll">
            <table class="data-table">
                <caption class="sr-only">图书借阅列表</caption>
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
                    <th scope="col">预计归还时间</th>
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
                            <c:if test="${book.status ==0}">
                                <span class="status-pill status-available">可借阅</span>
                            </c:if>
                            <c:if test="${book.status ==1}">
                                <span class="status-pill status-borrowed">借阅中</span>
                            </c:if>
                            <c:if test="${book.status ==2}">
                                <span class="status-pill status-returning">归还中</span>
                            </c:if>
                            <c:if test="${book.status ==3}">
                                <span class="status-pill status-offline">已下架</span>
                            </c:if>
                        </td>
                        <td>${book.borrower}</td>
                        <td>${book.borrowTime}</td>
                        <td>${book.returnTime}</td>
                        <td data-export="false">
                            <div class="table-actions">
                                <c:if test="${book.status ==0}">
                                    <button type="button" class="btn btn-sm btn-primary" data-toggle="modal"
                                            data-target="#borrowModal" data-kb-action="borrow" data-book-id="${book.id}">借阅
                                    </button>
                                    <c:if test="${USER_SESSION.role =='ADMIN'}">
                                        <button type="button" class="btn btn-sm btn-outline" data-toggle="modal"
                                                data-target="#addOrEditModal" data-kb-action="edit" data-book-id="${book.id}">编辑
                                        </button>
                                    </c:if>
                                </c:if>
                                <c:if test="${book.status ==1 ||book.status ==2}">
                                    <button type="button" class="btn btn-sm btn-outline" disabled="true">借阅</button>
                                </c:if>
                                <c:if test="${book.status ==3}">
                                    <button type="button" class="btn btn-sm btn-outline" disabled="true">已下架</button>
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
                <span class="status-pill status-available">可借阅</span>
                <span class="status-pill status-borrowed">借阅中</span>
                <span class="status-pill status-returning">归还中</span>
                <span class="status-pill status-offline">已下架</span>
            </div>
            <div id="pagination" class="pagination"></div>
        </c:otherwise>
    </c:choose>
</div>

<jsp:include page="/admin/book_modal.jsp"></jsp:include>

<div class="modal fade" id="addOrEditModal" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="addOrEditModalLabel"
     aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="addOrEditModalLabel">图书信息</h3>
            </div>
            <div class="modal-body">
                <form id="addOrEditBook" class="form-grid grid-2">
                    <input type="hidden" id="ebid" name="id">
                    <div class="form-field">
                        <label>图书名称</label>
                        <input class="input" placeholder="图书名称" name="name" id="ebname" required
                               maxlength="80" data-maxlength="80" data-count-target="count-ebname" aria-describedby="count-ebname"
                               data-normalize="true">
                        <div class="input-meta">
                            <span class="char-count" id="count-ebname">0/80</span>
                        </div>
                    </div>
                    <div class="form-field">
                        <label>标准ISBN</label>
                        <input class="input" placeholder="标准ISBN" name="isbn" id="ebisbn" required maxlength="13"
                               inputmode="numeric" pattern="\\d{13}" data-maxlength="13" data-count-target="count-ebisbn"
                               aria-describedby="count-ebisbn" data-digits-only="true">
                        <div class="input-meta">
                            <span class="char-count" id="count-ebisbn">0/13</span>
                        </div>
                    </div>
                    <div class="form-field">
                        <label>出版社</label>
                        <input class="input" placeholder="出版社" name="press" id="ebpress" required
                               maxlength="80" data-maxlength="80" data-count-target="count-ebpress" aria-describedby="count-ebpress"
                               data-normalize="true">
                        <div class="input-meta">
                            <span class="char-count" id="count-ebpress">0/80</span>
                        </div>
                    </div>
                    <div class="form-field">
                        <label>作者</label>
                        <input class="input" placeholder="作者" name="author" id="ebauthor" required
                               maxlength="60" data-maxlength="60" data-count-target="count-ebauthor" aria-describedby="count-ebauthor"
                               data-normalize="true">
                        <div class="input-meta">
                            <span class="char-count" id="count-ebauthor">0/60</span>
                        </div>
                    </div>
                    <div class="form-field">
                        <label>书籍页数</label>
                        <input class="input" type="number" min="1" placeholder="书籍页数" name="pagination" id="ebpagination" required
                               data-digits-only="true">
                    </div>
                    <div class="form-field">
                        <label>书籍价格</label>
                        <input class="input" type="number" min="0" step="0.01" placeholder="书籍价格" name="price" id="ebprice" required
                               inputmode="decimal" data-decimal="true">
                    </div>
                    <div class="form-field">
                        <label>上架状态</label>
                        <select class="select" id="ebstatus" name="status">
                            <option value="0">上架</option>
                            <option value="3">下架</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" type="button" id="aoe" disabled data-kb-action="save-book">保存
                </button>
                <button class="btn btn-ghost" type="button" data-dismiss="modal">关闭</button>
            </div>
        </div>
    </div>
</div>

<jsp:include page="/admin/_scripts.jsp" />
<script src="${pageContext.request.contextPath}/js/pagination.js?v=${appVersion}"></script>
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
