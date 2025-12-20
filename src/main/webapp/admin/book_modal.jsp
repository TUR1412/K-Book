<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<div class="modal fade" id="borrowModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
     aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="myModalLabel">借阅信息</h3>
            </div>
            <div class="modal-body">
                <form id="borrowBook" class="form-grid grid-2">
                    <input type="hidden" id="bid" name="id">
                    <div class="form-field">
                        <label>图书名称</label>
                        <input class="input" readonly name="name" id="bname">
                    </div>
                    <div class="form-field">
                        <label>标准ISBN</label>
                        <input class="input" readonly name="isbn" id="bisbn">
                    </div>
                    <div class="form-field">
                        <label>出版社</label>
                        <input class="input" readonly name="press" id="bpress">
                    </div>
                    <div class="form-field">
                        <label>作者</label>
                        <input class="input" readonly name="author" id="bauthor">
                    </div>
                    <div class="form-field">
                        <label>书籍页数</label>
                        <input class="input" readonly name="pagination" id="bpagination">
                    </div>
                    <div class="form-field">
                        <label>归还日期</label>
                        <input class="input" type="date" name="returnTime" id="time" onchange="cg()" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" data-dismiss="modal" aria-hidden="true" onclick="borrow(this)"
                        disabled="true" id="savemsg">确认借阅
                </button>
                <button class="btn btn-ghost" data-dismiss="modal" aria-hidden="true">关闭</button>
            </div>
        </div>
    </div>
</div>
