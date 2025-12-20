<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<jsp:include page="/admin/_layout_top.jsp">
    <jsp:param name="pageTitle" value="新书推荐" />
    <jsp:param name="pageHint" value="最新上架 · 借阅优先" />
    <jsp:param name="activeNav" value="new" />
</jsp:include>

<div class="card">
    <div class="card-header">
        <div>
            <h3 class="card-title">新书推荐</h3>
            <p class="card-subtitle">从最新上架图书中挑选阅读。</p>
        </div>
        <div class="card-header-actions">
            <span class="badge badge-muted is-hidden" data-table-count aria-live="polite"></span>
            <button type="button" class="btn btn-outline btn-sm" data-export-table data-export-name="新书推荐">导出 CSV</button>
        </div>
    </div>
    <c:choose>
        <c:when test="${empty pageResult.rows}">
            <jsp:include page="/admin/_empty_state.jsp">
                <jsp:param name="title" value="还没有新上架图书" />
                <jsp:param name="desc" value="稍后再来看看。" />
            </jsp:include>
        </c:when>
        <c:otherwise>
            <div class="table-scroll">
            <table class="data-table">
                <caption class="sr-only">新书推荐列表</caption>
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
                            <c:if test="${book.status ==0}">
                                <button type="button" class="btn btn-sm btn-primary" data-toggle="modal"
                                        data-target="#borrowModal" onclick="findBookById(${book.id},'borrow')">借阅
                                </button>
                            </c:if>
                            <c:if test="${book.status ==1 ||book.status ==2}">
                                <button type="button" class="btn btn-sm btn-outline" disabled="true">借阅</button>
                            </c:if>
                            <c:if test="${book.status ==3}">
                                <button type="button" class="btn btn-sm btn-outline" disabled="true">已下架</button>
                            </c:if>
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
        </c:otherwise>
    </c:choose>
</div>

<jsp:include page="/admin/book_modal.jsp"></jsp:include>

<jsp:include page="/admin/_scripts.jsp" />
<jsp:include page="/admin/_layout_bottom.jsp" />
