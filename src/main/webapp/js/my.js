function notify(message, type) {
    if (window.kbToast) {
        window.kbToast(message, type);
        return;
    }
    alert(message);
}

function buildMessage(response, fallback) {
    var message = (response && response.message) || fallback || "";
    if (response && response.actionableSuggestion) {
        message += "（" + response.actionableSuggestion + "）";
    }
    return message;
}

function setButtonLoading(button, isLoading, text) {
    if (!button) {
        return;
    }
    var $btn = $(button);
    if (isLoading) {
        if (!button.dataset.originText) {
            button.dataset.originText = $btn.text();
        }
        $btn.text(text || "处理中...");
        $btn.attr("disabled", true).addClass("is-loading");
    } else {
        $btn.text(button.dataset.originText || $btn.text());
        $btn.attr("disabled", false).removeClass("is-loading");
    }
}

function getProjectPath() {
    if (window.__ctx) {
        return window.__ctx;
    }
    var pathName = window.document.location.pathname;
    return pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
}

function markInvalid($input, message) {
    $input.addClass('input-invalid');
    if (message) {
        notify(message, 'error');
    }
}

function clearInvalid($input) {
    $input.removeClass('input-invalid');
}

function cg() {
    var dateStr = $("#time").val();
    if (!dateStr) {
        $("#savemsg").attr("disabled", true);
        return;
    }
    var selected = new Date(dateStr + "T00:00:00");
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
        notify("归还日期不能早于今天。", "error");
        $("#savemsg").attr("disabled", true);
        return;
    }
    $("#savemsg").attr("disabled", false);
}

function borrow(button) {
    var url = getProjectPath() + "/book/borrowBook";
    setButtonLoading(button, true, "提交中...");
    $.post(url, $("#borrowBook").serialize(), function (response) {
        if (response && response.success === true) {
            notify(buildMessage(response, "借阅成功，请到行政中心取书。"), "success");
            setTimeout(function () {
                window.location.href = getProjectPath() + "/book/search";
            }, 700);
            return;
        }
        setButtonLoading(button, false);
        notify(buildMessage(response, "借阅失败，请稍后再试。"), "error");
    }).fail(function () {
        setButtonLoading(button, false);
        notify("网络繁忙，请稍后再试。", "error");
    });
}

function resetFrom() {
    $("#aoe").attr("disabled", true);
    var $vals = $("#addOrEditBook input");
    $vals.each(function () {
        $(this).val("").removeClass("input-invalid");
    });
}

function resetStyle() {
    $("#aoe").attr("disabled", false);
    var $vals = $("#addOrEditBook input");
    $vals.each(function () {
        $(this).removeClass("input-invalid");
    });
}

function findBookById(id, doname) {
    resetStyle();
    var url = getProjectPath() + "/book/findById?id=" + id;
    $.get(url, function (response) {
        if (!response || response.success !== true) {
            notify(buildMessage(response, "查询图书失败，请稍后再试。"), "error");
            return;
        }
        if (doname === 'edit') {
            $("#ebid").val(response.data.id);
            $("#ebname").val(response.data.name);
            $("#ebisbn").val(response.data.isbn);
            $("#ebpress").val(response.data.press);
            $("#ebauthor").val(response.data.author);
            $("#ebpagination").val(response.data.pagination);
            $("#ebprice").val(response.data.price);
            $("#ebstatus").val(response.data.status);
        }
        if (doname === 'borrow') {
            $("#savemsg").attr("disabled", true);
            $("#time").val("");
            var today = new Date();
            var month = String(today.getMonth() + 1).padStart(2, "0");
            var day = String(today.getDate()).padStart(2, "0");
            $("#time").attr("min", today.getFullYear() + "-" + month + "-" + day);
            var target = new Date();
            target.setDate(target.getDate() + 7);
            var tMonth = String(target.getMonth() + 1).padStart(2, "0");
            var tDay = String(target.getDate()).padStart(2, "0");
            $("#time").val(target.getFullYear() + "-" + tMonth + "-" + tDay);
            cg();
            $("#bid").val(response.data.id);
            $("#bname").val(response.data.name);
            $("#bisbn").val(response.data.isbn);
            $("#bpress").val(response.data.press);
            $("#bauthor").val(response.data.author);
            $("#bpagination").val(response.data.pagination);
        }
    }).fail(function () {
        notify("网络繁忙，请稍后再试。", "error");
    });
}

function addOrEdit(button) {
    var ebid = $("#ebid").val();
    if (ebid > 0) {
        var url = getProjectPath() + "/book/editBook";
        setButtonLoading(button, true, "保存中...");
        $.post(url, $("#addOrEditBook").serialize(), function (response) {
            if (response && response.success === true) {
                notify(buildMessage(response, "编辑成功！"), "success");
                setTimeout(function () {
                    window.location.href = getProjectPath() + "/book/search";
                }, 700);
                return;
            }
            setButtonLoading(button, false);
            notify(buildMessage(response, "编辑失败，请稍后再试。"), "error");
        }).fail(function () {
            setButtonLoading(button, false);
            notify("网络繁忙，请稍后再试。", "error");
        });
    } else {
        var createUrl = getProjectPath() + "/book/addBook";
        setButtonLoading(button, true, "保存中...");
        $.post(createUrl, $("#addOrEditBook").serialize(), function (response) {
            if (response && response.success === true) {
                notify(buildMessage(response, "新增图书成功！"), "success");
                setTimeout(function () {
                    window.location.href = getProjectPath() + "/book/search";
                }, 700);
                return;
            }
            setButtonLoading(button, false);
            notify(buildMessage(response, "新增失败，请稍后再试。"), "error");
        }).fail(function () {
            setButtonLoading(button, false);
            notify("网络繁忙，请稍后再试。", "error");
        });
    }
}

function returnBook(bid, button) {
    var r = confirm("确定归还图书？");
    if (!r) {
        notify("已取消归还操作。", "info");
        return;
    }
    var url = getProjectPath() + "/book/returnBook?id=" + bid;
    setButtonLoading(button, true, "提交中...");
    $.get(url, function (response) {
        if (response && response.success === true) {
            notify(buildMessage(response, "归还申请已提交。"), "success");
            setTimeout(function () {
                window.location.href = getProjectPath() + "/book/searchBorrowed";
            }, 700);
            return;
        }
        setButtonLoading(button, false);
        notify(buildMessage(response, "归还失败，请稍后再试。"), "error");
    }).fail(function () {
        setButtonLoading(button, false);
        notify("网络繁忙，请稍后再试。", "error");
    });
}

function returnConfirm(bid, button) {
    var r = confirm("确定图书已归还？");
    if (!r) {
        notify("已取消归还确认。", "info");
        return;
    }
    var url = getProjectPath() + "/book/returnConfirm?id=" + bid;
    setButtonLoading(button, true, "确认中...");
    $.get(url, function (response) {
        if (response && response.success === true) {
            notify(buildMessage(response, "确认成功！"), "success");
            setTimeout(function () {
                window.location.href = getProjectPath() + "/book/searchBorrowed";
            }, 700);
            return;
        }
        setButtonLoading(button, false);
        notify(buildMessage(response, "确认失败，请稍后再试。"), "error");
    }).fail(function () {
        setButtonLoading(button, false);
        notify("网络繁忙，请稍后再试。", "error");
    });
}

function checkval() {
    var $inputs = $("#addOrEditBook input");
    var invalid = false;
    $inputs.each(function () {
        if ($(this).val() === '' || $(this).hasClass('input-invalid')) {
            invalid = true;
        }
    });
    if (!invalid) {
        $("#aoe").attr("disabled", false);
    }
}

$(function () {
    if (!window.jQuery) {
        return;
    }
    $("#ebpagination").on("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });
    $("#ebprice").on("input", function () {
        var cleaned = this.value.replace(/[^0-9.]/g, "");
        var parts = cleaned.split(".");
        if (parts.length > 2) {
            cleaned = parts[0] + "." + parts.slice(1).join("");
        }
        this.value = cleaned;
    });
    var $inputs = $("#addOrEditBook input");
    var lastIsbn = "";
    $inputs.each(function () {
        $(this).blur(function () {
            var value = $(this).val();
            if (!value) {
                $("#aoe").attr("disabled", true);
                markInvalid($(this), "该字段不能为空。");
                return;
            }
            if ($(this).attr("name") === "isbn" && lastIsbn !== value) {
                if (!/^\d{13}$/.test(value)) {
                    $("#aoe").attr("disabled", true);
                    markInvalid($(this), "ISBN 必须为 13 位数字。");
                    return;
                }
            }
            clearInvalid($(this));
            checkval();
        }).focus(function () {
            clearInvalid($(this));
            if ($(this).attr("name") === "isbn") {
                lastIsbn = $(this).val();
            }
        });
    });
});

var pageargs = {
    cur: 1,
    total: 0,
    len: 5,
    pagesize: 10,
    gourl: "",
    targetId: 'pagination',
    callback: function (total) {
        var oPages = document.getElementsByClassName('page-index');
        for (var i = 0; i < oPages.length; i++) {
            oPages[i].onclick = function () {
                changePage(this.getAttribute('data-index'), pageargs.pagesize);
            };
        }
        var goPage = document.getElementById('go-search');
        if (goPage) {
            goPage.onclick = function () {
                var index = document.getElementById('yeshu').value;
                if (!index || (+index > total) || (+index < 1)) {
                    return;
                }
                changePage(index, pageargs.pagesize);
            };
        }
        var input = document.getElementById('yeshu');
        if (input) {
            input.onkeydown = function (event) {
                if (event.key !== 'Enter') {
                    return;
                }
                event.preventDefault();
                var index = input.value;
                if (!index || (+index > total) || (+index < 1)) {
                    return;
                }
                changePage(index, pageargs.pagesize);
            };
        }
    }
};

var bookVO = {
    name: '',
    author: '',
    press: ''
};

var recordVO = {
    bookname: '',
    borrower: ''
};

function changePage(pageNo, pageSize) {
    pageargs.cur = pageNo;
    pageargs.pagesize = pageSize;
    var form = document.createElement('form');
    form.action = pageargs.gourl;
    form.method = 'post';
    form.style.display = 'none';
    var addField = function (name, value) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    };
    addField('pageNum', pageargs.cur);
    addField('pageSize', pageargs.pagesize);
    if (pageargs.gourl.indexOf("book") >= 0) {
        addField('name', bookVO.name);
        addField('author', bookVO.author);
        addField('press', bookVO.press);
    }
    if (pageargs.gourl.indexOf("record") >= 0) {
        addField('bookname', recordVO.bookname);
        addField('borrower', recordVO.borrower);
    }
    document.body.appendChild(form);
    form.submit();
    if (typeof pagination === 'function') {
        pagination(pageargs);
    }
}
