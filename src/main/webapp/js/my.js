// @ts-check
/// <reference path="./kb-types.d.ts" />

var KB_REDIRECT_DELAY_MS = 700;
var KB_NETWORK_ERROR_MESSAGE = "网络繁忙，请稍后再试。";
var KB_FORM_PROCESSING_TEXT = "处理中...";
var KB_BORROW_DEFAULT_DAYS = 7;

var KB_BOOK_ENDPOINTS = Object.freeze({
    BORROW: "/book/borrowBook",
    SEARCH: "/book/search",
    SEARCH_BORROWED: "/book/searchBorrowed",
    FIND_BY_ID: "/book/findById",
    ADD: "/book/addBook",
    EDIT: "/book/editBook",
    RETURN: "/book/returnBook",
    RETURN_CONFIRM: "/book/returnConfirm"
});

var KB_BOOK_MODAL_MODE = Object.freeze({
    EDIT: "edit",
    BORROW: "borrow"
});

/** @param {string} message @param {Kb.ToastType=} type */
function notify(message, type) {
    if (window.kbToast) {
        window.kbToast(message, type);
        return;
    }
    alert(message);
}

/** @param {Kb.ApiResponse<any>=} response @param {string=} fallback */
function buildMessage(response, fallback) {
    var message = (response && response.message) || fallback || "";
    if (response && response.actionableSuggestion) {
        message += "（" + response.actionableSuggestion + "）";
    }
    return message;
}

function qs(selector, root) {
    return (root || document).querySelector(selector);
}

function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function setButtonLoading(button, isLoading, text) {
    if (!button) {
        return;
    }
    if (isLoading) {
        if (!button.dataset.originText) {
            button.dataset.originText = button.textContent || "";
        }
        button.textContent = text || KB_FORM_PROCESSING_TEXT;
        button.disabled = true;
        button.classList.add("is-loading");
        button.setAttribute("aria-busy", "true");
        return;
    }
    button.textContent = button.dataset.originText || button.textContent || "";
    button.disabled = false;
    button.classList.remove("is-loading");
    button.removeAttribute("aria-busy");
}

function getProjectPath() {
    if (window.__ctx) {
        return window.__ctx;
    }
    var pathName = window.document.location.pathname;
    return pathName.substring(0, pathName.substr(1).indexOf("/") + 1);
}

function markInvalid(input, message) {
    if (!input) {
        return;
    }
    input.classList.add("input-invalid");
    if (message) {
        notify(message, "error");
    }
}

function clearInvalid(input) {
    if (!input) {
        return;
    }
    input.classList.remove("input-invalid");
}

function serializeForm(form) {
    var params = new URLSearchParams();
    if (!form || !form.elements) {
        return params;
    }
    Array.prototype.forEach.call(form.elements, function (el) {
        if (!el || el.disabled || !el.name) {
            return;
        }
        var type = (el.type || "").toLowerCase();
        if ((type === "checkbox" || type === "radio") && !el.checked) {
            return;
        }
        params.append(el.name, el.value == null ? "" : String(el.value));
    });
    return params;
}

function requestJson(url, options) {
    if (window.kbApi && typeof window.kbApi.request === "function") {
        return window.kbApi.request(url, options || {});
    }
    var finalUrl = url;
    if (finalUrl && finalUrl.charAt && finalUrl.charAt(0) === "/" && finalUrl.indexOf(getProjectPath() + "/") !== 0) {
        finalUrl = getProjectPath() + finalUrl;
    }
    var fetchOptions = options || {};
    fetchOptions.headers = Object.assign(
        {
            "X-Requested-With": "XMLHttpRequest"
        },
        fetchOptions.headers || {}
    );
    return fetch(finalUrl, fetchOptions).then(function (res) {
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }
        return res.json();
    });
}

function getJson(url) {
    return requestJson(url, { method: "GET", credentials: "same-origin" });
}

function postForm(url, form) {
    if (window.kbApi && typeof window.kbApi.postForm === "function") {
        return window.kbApi.postForm(url, form, { credentials: "same-origin" });
    }
    var body = serializeForm(form).toString();
    return requestJson(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: body
    });
}

function validateReturnDate() {
    var dateInput = qs("#time");
    var saveButton = qs("#savemsg");
    if (!dateInput || !saveButton) {
        return;
    }
    var dateStr = dateInput.value;
    if (!dateStr) {
        saveButton.disabled = true;
        return;
    }
    var selected = new Date(dateStr + "T00:00:00");
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
        notify("归还日期不能早于今天。", "error");
        saveButton.disabled = true;
        return;
    }
    saveButton.disabled = false;
}

function borrow(button) {
    var url = KB_BOOK_ENDPOINTS.BORROW;
    var form = qs("#borrowBook");
    if (!form) {
        notify("借阅表单未找到。", "error");
        return;
    }
    setButtonLoading(button, true, "提交中...");
    postForm(url, form)
        .then(function (response) {
            if (response && response.success === true) {
                notify(buildMessage(response, "借阅成功，请到行政中心取书。"), "success");
                setTimeout(function () {
                    window.location.href = getProjectPath() + KB_BOOK_ENDPOINTS.SEARCH;
                }, KB_REDIRECT_DELAY_MS);
                return;
            }
            setButtonLoading(button, false);
            notify(buildMessage(response, "借阅失败，请稍后再试。"), "error");
        })
        .catch(function () {
            setButtonLoading(button, false);
            notify(KB_NETWORK_ERROR_MESSAGE, "error");
        });
}

function resetBookForm() {
    var save = qs("#aoe");
    if (save) {
        save.disabled = true;
    }
    var inputs = qsa("#addOrEditBook input");
    inputs.forEach(function (input) {
        input.value = "";
        input.classList.remove("input-invalid");
    });
}

function resetStyle() {
    var save = qs("#aoe");
    if (save) {
        save.disabled = false;
    }
    var inputs = qsa("#addOrEditBook input");
    inputs.forEach(function (input) {
        input.classList.remove("input-invalid");
    });
}

function findBookById(id, doname) {
    resetStyle();
    var safeId = String(id || "").trim();
    if (!safeId) {
        notify("图书ID无效。", "error");
        return;
    }
    var mode = String(doname || "");
    var url = KB_BOOK_ENDPOINTS.FIND_BY_ID + "?id=" + encodeURIComponent(safeId);
    getJson(url)
        .then(function (response) {
            if (!response || response.success !== true) {
                notify(buildMessage(response, "查询图书失败，请稍后再试。"), "error");
                return;
            }
            if (!response.data) {
                notify(buildMessage(response, "未找到对应图书。"), "error");
                return;
            }
            if (mode === KB_BOOK_MODAL_MODE.EDIT) {
                var map = {
                    ebid: response.data.id,
                    ebname: response.data.name,
                    ebisbn: response.data.isbn,
                    ebpress: response.data.press,
                    ebauthor: response.data.author,
                    ebpagination: response.data.pagination,
                    ebprice: response.data.price,
                    ebstatus: response.data.status
                };
                Object.keys(map).forEach(function (key) {
                    var el = qs("#" + key);
                    if (el) {
                        el.value = map[key] == null ? "" : String(map[key]);
                    }
                });
                return;
            }
            if (mode === KB_BOOK_MODAL_MODE.BORROW) {
                var saveButton = qs("#savemsg");
                if (saveButton) {
                    saveButton.disabled = true;
                }
                var time = qs("#time");
                if (time) {
                    time.value = "";
                    var today = new Date();
                    var month = String(today.getMonth() + 1).padStart(2, "0");
                    var day = String(today.getDate()).padStart(2, "0");
                    time.min = today.getFullYear() + "-" + month + "-" + day;
                    var target = new Date();
                    target.setDate(target.getDate() + KB_BORROW_DEFAULT_DAYS);
                    var tMonth = String(target.getMonth() + 1).padStart(2, "0");
                    var tDay = String(target.getDate()).padStart(2, "0");
                    time.value = target.getFullYear() + "-" + tMonth + "-" + tDay;
                }
                validateReturnDate();
                var borrowMap = {
                    bid: response.data.id,
                    bname: response.data.name,
                    bisbn: response.data.isbn,
                    bpress: response.data.press,
                    bauthor: response.data.author,
                    bpagination: response.data.pagination
                };
                Object.keys(borrowMap).forEach(function (key) {
                    var el = qs("#" + key);
                    if (el) {
                        el.value = borrowMap[key] == null ? "" : String(borrowMap[key]);
                    }
                });
            }
        })
        .catch(function () {
            notify(KB_NETWORK_ERROR_MESSAGE, "error");
        });
}

function addOrEdit(button) {
    var idInput = qs("#ebid");
    var form = qs("#addOrEditBook");
    if (!form) {
        notify("图书表单未找到。", "error");
        return;
    }
    var ebid = idInput && idInput.value ? parseInt(idInput.value, 10) : 0;
    if (ebid > 0) {
        var url = KB_BOOK_ENDPOINTS.EDIT;
        setButtonLoading(button, true, "保存中...");
        postForm(url, form)
            .then(function (response) {
                if (response && response.success === true) {
                    notify(buildMessage(response, "编辑成功！"), "success");
                    setTimeout(function () {
                        window.location.href = getProjectPath() + KB_BOOK_ENDPOINTS.SEARCH;
                    }, KB_REDIRECT_DELAY_MS);
                    return;
                }
                setButtonLoading(button, false);
                notify(buildMessage(response, "编辑失败，请稍后再试。"), "error");
            })
            .catch(function () {
                setButtonLoading(button, false);
                notify(KB_NETWORK_ERROR_MESSAGE, "error");
            });
        return;
    }
    var createUrl = KB_BOOK_ENDPOINTS.ADD;
    setButtonLoading(button, true, "保存中...");
    postForm(createUrl, form)
        .then(function (response) {
            if (response && response.success === true) {
                notify(buildMessage(response, "新增图书成功！"), "success");
                setTimeout(function () {
                    window.location.href = getProjectPath() + KB_BOOK_ENDPOINTS.SEARCH;
                }, KB_REDIRECT_DELAY_MS);
                return;
            }
            setButtonLoading(button, false);
            notify(buildMessage(response, "新增失败，请稍后再试。"), "error");
        })
        .catch(function () {
            setButtonLoading(button, false);
            notify(KB_NETWORK_ERROR_MESSAGE, "error");
        });
}

function returnBook(bid, button) {
    var r = confirm("确定归还图书？");
    if (!r) {
        notify("已取消归还操作。", "info");
        return;
    }
    var safeId = String(bid || "").trim();
    if (!safeId) {
        notify("图书ID无效。", "error");
        return;
    }
    var url = KB_BOOK_ENDPOINTS.RETURN + "?id=" + encodeURIComponent(safeId);
    setButtonLoading(button, true, "提交中...");
    getJson(url)
        .then(function (response) {
            if (response && response.success === true) {
                notify(buildMessage(response, "归还申请已提交。"), "success");
                setTimeout(function () {
                    window.location.href = getProjectPath() + KB_BOOK_ENDPOINTS.SEARCH_BORROWED;
                }, KB_REDIRECT_DELAY_MS);
                return;
            }
            setButtonLoading(button, false);
            notify(buildMessage(response, "归还失败，请稍后再试。"), "error");
        })
        .catch(function () {
            setButtonLoading(button, false);
            notify(KB_NETWORK_ERROR_MESSAGE, "error");
        });
}

function returnConfirm(bid, button) {
    var r = confirm("确定图书已归还？");
    if (!r) {
        notify("已取消归还确认。", "info");
        return;
    }
    var safeId = String(bid || "").trim();
    if (!safeId) {
        notify("图书ID无效。", "error");
        return;
    }
    var url = KB_BOOK_ENDPOINTS.RETURN_CONFIRM + "?id=" + encodeURIComponent(safeId);
    setButtonLoading(button, true, "确认中...");
    getJson(url)
        .then(function (response) {
            if (response && response.success === true) {
                notify(buildMessage(response, "确认成功！"), "success");
                setTimeout(function () {
                    window.location.href = getProjectPath() + KB_BOOK_ENDPOINTS.SEARCH_BORROWED;
                }, KB_REDIRECT_DELAY_MS);
                return;
            }
            setButtonLoading(button, false);
            notify(buildMessage(response, "确认失败，请稍后再试。"), "error");
        })
        .catch(function () {
            setButtonLoading(button, false);
            notify(KB_NETWORK_ERROR_MESSAGE, "error");
        });
}

function updateBookSaveState() {
    var inputs = qsa("#addOrEditBook input");
    var invalid = false;
    inputs.forEach(function (input) {
        if (!input.value || input.classList.contains("input-invalid")) {
            invalid = true;
        }
    });
    var save = qs("#aoe");
    if (save) {
        save.disabled = invalid;
    }
}

function bindBookFormEnhancements() {
    var pagination = qs("#ebpagination");
    if (pagination) {
        pagination.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");
        });
    }
    var price = qs("#ebprice");
    if (price) {
        price.addEventListener("input", function () {
            var cleaned = this.value.replace(/[^0-9.]/g, "");
            var parts = cleaned.split(".");
            if (parts.length > 2) {
                cleaned = parts[0] + "." + parts.slice(1).join("");
            }
            this.value = cleaned;
        });
    }

    var inputs = qsa("#addOrEditBook input");
    if (!inputs.length) {
        return;
    }

    var lastIsbn = "";
    inputs.forEach(function (input) {
        input.addEventListener("blur", function () {
            var value = input.value;
            if (!value) {
                var save = qs("#aoe");
                if (save) {
                    save.disabled = true;
                }
                markInvalid(input, "该字段不能为空。");
                return;
            }
            if (input.name === "isbn" && lastIsbn !== value) {
                if (!/^\d{13}$/.test(value)) {
                    var saveBtn = qs("#aoe");
                    if (saveBtn) {
                        saveBtn.disabled = true;
                    }
                    markInvalid(input, "ISBN 必须为 13 位数字。");
                    return;
                }
            }
            clearInvalid(input);
            updateBookSaveState();
        });
        input.addEventListener("focus", function () {
            clearInvalid(input);
            if (input.name === "isbn") {
                lastIsbn = input.value;
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    bindBookFormEnhancements();
    bindBorrowModalEnhancements();
    bindDataActions();
});

function bindBorrowModalEnhancements() {
    var dateInput = qs("#time");
    if (dateInput) {
        dateInput.addEventListener("change", function () {
            validateReturnDate();
        });
        dateInput.addEventListener("blur", function () {
            validateReturnDate();
        });
    }
}

function bindDataActions() {
    document.addEventListener("click", function (event) {
        var trigger = event.target && event.target.closest ? event.target.closest("[data-kb-action]") : null;
        if (!trigger) {
            return;
        }
        var action = trigger.getAttribute("data-kb-action") || "";
        if (!action) {
            return;
        }
        if (action === "new-book") {
            resetBookForm();
            return;
        }
        if (action === "borrow") {
            var bid = trigger.getAttribute("data-book-id");
            findBookById(bid, KB_BOOK_MODAL_MODE.BORROW);
            return;
        }
        if (action === "edit") {
            var eid = trigger.getAttribute("data-book-id");
            findBookById(eid, KB_BOOK_MODAL_MODE.EDIT);
            return;
        }
        if (action === "borrow-submit") {
            borrow(trigger);
            return;
        }
        if (action === "save-book") {
            addOrEdit(trigger);
            return;
        }
        if (action === "return-book") {
            var rid = trigger.getAttribute("data-book-id");
            returnBook(rid, trigger);
            return;
        }
        if (action === "return-confirm") {
            var cid = trigger.getAttribute("data-book-id");
            returnConfirm(cid, trigger);
        }
    });
}

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
            oPages[i].onclick = function (event) {
                if (event && event.preventDefault) {
                    event.preventDefault();
                }
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
    if (window.__csrf) {
        addField('_csrf', window.__csrf);
    }
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
