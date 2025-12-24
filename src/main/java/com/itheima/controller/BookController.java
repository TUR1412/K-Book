package com.itheima.controller;
import com.itheima.domain.Book;
import com.itheima.domain.User;
import com.itheima.service.BookService;
import entity.PageResult;
import entity.Result;
import entity.Results;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Map;

/*
图书信息Controller
 */
@Controller
@RequestMapping("/book")
public class BookController {
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_NAME_LEN = 80;
    private static final int MAX_AUTHOR_LEN = 60;
    private static final int MAX_PRESS_LEN = 80;
    private static final int MAX_BORROWER_LEN = 40;
    private static final int MAX_BORROW_DAYS = 90;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final Logger logger = LoggerFactory.getLogger(BookController.class);
    //注入BookService对象
    @Autowired
    private BookService bookService;
    /**
     * 查询最新上架的图书
     */
    @RequestMapping("/selectNewbooks")
    public ModelAndView selectNewbooks() {
        //查询最新上架的5个的图书信息
        int pageNum = 1;
        int pageSize = 5;
        PageResult pageResult = bookService.selectNewBooks(pageNum, pageSize);
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("books_new");
        modelAndView.addObject("pageResult", pageResult);
        return modelAndView;
    }
/**
 * 根据图书id查询图书信息
 * @param id 查询的图书id
 */
@ResponseBody
@RequestMapping("/findById")
public Result<Book> findById(String id) {
    try {
        String safeId = trimToNull(id);
        if (safeId == null || !safeId.matches("\\\\d+")) {
            return Results.fail("图书ID无效！", "请从列表重新选择图书。");
        }
        Book book=bookService.findById(safeId);
        if(book==null){
            return Results.fail("未找到对应图书。", "请确认图书未被下架或已删除。");
        }
        return Results.ok("查询图书成功", book);
    }catch (Exception e){
        logger.error("查询图书失败", e);
        return Results.fail("查询图书失败！", "请稍后重试或联系管理员。");
    }
}
/**
 * 借阅图书
 * @param book 借阅的图书
 * @return
 */
@ResponseBody
@RequestMapping("/borrowBook")
public Result<Void> borrowBook(Book book, HttpSession session) {
    //获取当前登录的用户姓名
    User user = (User) session.getAttribute("USER_SESSION");
    if (user == null) {
        return Results.fail("登录已过期。", "请重新登录后再试。");
    }
    if (book == null || book.getId() == null || book.getId() <= 0) {
        return Results.fail("请选择需要借阅的图书。", "请从列表重新发起借阅。");
    }
    sanitizeBook(book);
    Result<Void> validation = validateBorrowRequest(book);
    if (validation != null) {
        return validation;
    }
    String pname = user.getName();
    book.setBorrower(normalizeText(pname, MAX_BORROWER_LEN));
    try {
        //根据图书的id和用户进行图书借阅
        Integer count = bookService.borrowBook(book);
        if (count != 1) {
            return Results.fail("借阅图书失败!", "请检查图书是否可借阅，或稍后再试。");
        }
        return Results.ok("借阅成功，请到行政中心取书!");
    } catch (Exception e) {
        logger.error("借阅图书失败", e);
        return Results.fail("借阅图书失败!", "请稍后重试或联系管理员。");
    }
}

/**
 * 分页查询符合条件且未下架图书信息
 * @param book 查询的条件封装到book中
 * @param pageNum  数据列表的当前页码
 * @param pageSize 数据列表1页展示多少条数据
 */
@RequestMapping("/search")
public ModelAndView search(Book book, Integer pageNum, Integer pageSize, HttpServletRequest request) {
    pageNum = normalizePageNum(pageNum);
    pageSize = normalizePageSize(pageSize);
    sanitizeBook(book);
    //查询到的图书信息
    PageResult pageResult = bookService.search(book, pageNum, pageSize);
    ModelAndView modelAndView = new ModelAndView();
    modelAndView.setViewName("books");
    //将查询到的数据存放在 ModelAndView的对象中
    modelAndView.addObject("pageResult", pageResult);
    //将查询的参数返回到页面，用于回显到查询的输入框中
    modelAndView.addObject("search", book);
    //将当前页码返回到页面，用于分页插件的分页显示
    modelAndView.addObject("pageNum", pageNum);
    //将当前查询的控制器路径返回到页面，页码变化时继续向该路径发送请求
    modelAndView.addObject("gourl", request.getRequestURI());
    return modelAndView;
}

/**
 * 新增图书
 * @param book 页面表单提交的图书信息
 * 将新增的结果和向页面传递信息封装到Result对象中返回
 */
@ResponseBody
@RequestMapping("/addBook")
public Result<Void> addBook(Book book, HttpSession session) {
    try {
        User user = session == null ? null : (User) session.getAttribute("USER_SESSION");
        if (!isAdmin(user)) {
            return Results.fail("无权限操作。", "请使用管理员账号。");
        }
        if (book == null) {
            return Results.fail("新增图书失败!", "请确认表单已填写完整。");
        }
        sanitizeBook(book);
        Result<Void> validate = validateBookPayload(book, false);
        if (validate != null) {
            return validate;
        }
        Integer count=bookService.addBook(book);
        if(count!=1){
            return Results.fail("新增图书失败!", "请检查必填字段并重试。");
        }
        return Results.ok("新增图书成功!");
    }catch (Exception e){
        logger.error("新增图书失败", e);
        return Results.fail("新增图书失败!", "请稍后重试或联系管理员。");
    }
}

/**
 * 编辑图书信息
 * @param book 编辑的图书信息
 */
@ResponseBody
@RequestMapping("/editBook")
public Result<Void> editBook(Book book, HttpSession session) {
    try {
        User user = session == null ? null : (User) session.getAttribute("USER_SESSION");
        if (!isAdmin(user)) {
            return Results.fail("无权限操作。", "请使用管理员账号。");
        }
        if (book == null || book.getId() == null) {
            return Results.fail("编辑失败!", "请从列表重新选择图书。");
        }
        sanitizeBook(book);
        Result<Void> validate = validateBookPayload(book, true);
        if (validate != null) {
            return validate;
        }
        Book existing = bookService.findById(String.valueOf(book.getId()));
        if (existing != null && ("1".equals(existing.getStatus()) || "2".equals(existing.getStatus()))) {
            book.setStatus(existing.getStatus());
        }
        Integer count= bookService.editBook(book);
        if(count!=1){
            return Results.fail("编辑失败!", "请检查输入并重试。");
        }
        return Results.ok("编辑成功!");
    }catch (Exception e){
        logger.error("编辑图书失败", e);
        return Results.fail("编辑失败!", "请稍后重试或联系管理员。");
    }
}

/**
 *分页查询当前被借阅且未归还的图书信息
 * @param pageNum  数据列表的当前页码
 * @param pageSize 数据列表1页展示多少条数据
 */
@RequestMapping("/searchBorrowed")
public ModelAndView searchBorrowed(Book book,Integer pageNum, Integer pageSize, HttpServletRequest request) {
    pageNum = normalizePageNum(pageNum);
    pageSize = normalizePageSize(pageSize);
    //获取当前登录的用户
    User user = (User) request.getSession().getAttribute("USER_SESSION");
    if (user == null) {
        request.setAttribute("msg", "您还没有登录，请先登录！");
        return new ModelAndView("forward:/admin/login.jsp");
    }
    sanitizeBook(book);
    PageResult pageResult = bookService.searchBorrowed(book,user, pageNum, pageSize);
    ModelAndView modelAndView = new ModelAndView();
    modelAndView.setViewName("book_borrowed");
    //将查询到的数据存放在 ModelAndView的对象中
    modelAndView.addObject("pageResult", pageResult);
    //将查询的参数返回到页面，用于回显到查询的输入框中
    modelAndView.addObject("search", book);
    //将当前页码返回到页面，用于分页插件的分页显示
    modelAndView.addObject("pageNum", pageNum);
    //将当前查询的控制器路径返回到页面，页码变化时继续向该路径发送请求
    modelAndView.addObject("gourl", request.getRequestURI());
    return modelAndView;
}
/**
 * 归还图书
 * @param id 归还的图书的id
 */
@ResponseBody
@RequestMapping("/returnBook")
public Result<Void> returnBook(String id, HttpSession session) {
    //获取当前登录的用户信息
    User user = (User) session.getAttribute("USER_SESSION");
    if (user == null) {
        return Results.fail("登录已过期。", "请重新登录后再试。");
    }
    String safeId = trimToNull(id);
    if (safeId == null || !safeId.matches("\\\\d+")) {
        return Results.fail("图书ID无效!", "请从列表重新选择图书。");
    }
    try {
        boolean flag = bookService.returnBook(safeId, user);
        if (!flag) {
            return Results.fail("还书失败!", "请确认借阅人与当前账号一致。");
        }
        return Results.ok("还书确认中，请先到行政中心还书!");
    }catch (Exception e){
        logger.error("归还图书失败", e);
        return Results.fail("还书失败!", "请稍后重试或联系管理员。");
    }
}

/**
 * 确认图书归还
 * @param id 确认归还的图书的id
 */
@ResponseBody
@RequestMapping("/returnConfirm")
public Result<Void> returnConfirm(String id, HttpSession session) {
    try {
        User user = session == null ? null : (User) session.getAttribute("USER_SESSION");
        if (!isAdmin(user)) {
            return Results.fail("无权限操作。", "请使用管理员账号。");
        }
        String safeId = trimToNull(id);
        if (safeId == null || !safeId.matches("\\\\d+")) {
            return Results.fail("确认失败!", "请从列表重新选择图书。");
        }
        Integer count=bookService.returnConfirm(safeId);
        if(count!=1){
            return Results.fail("确认失败!", "请确认图书状态为归还中。");
        }
        return Results.ok("确认成功!");
    }catch (Exception e){
        logger.error("归还确认失败", e);
        return Results.fail("确认失败!", "请稍后重试或联系管理员。");
    }
}

/**
 * 仪表盘摘要数据
 */
@ResponseBody
@RequestMapping("/summary")
public Result<Map<String, Integer>> summary(HttpSession session) {
    User user = (User) session.getAttribute("USER_SESSION");
    if (user == null) {
        return Results.fail("登录已过期。", "请重新登录后刷新页面。");
    }
    try {
        Map<String, Integer> data = bookService.getSummary(user);
        return Results.ok("查询成功", data);
    } catch (Exception e) {
        logger.error("获取仪表盘摘要失败", e);
        return Results.fail("获取摘要失败。", "请稍后重试。");
    }
}

private void sanitizeBook(Book book) {
    if (book == null) {
        return;
    }
    book.setName(normalizeText(book.getName(), MAX_NAME_LEN));
    book.setAuthor(normalizeText(book.getAuthor(), MAX_AUTHOR_LEN));
    book.setPress(normalizeText(book.getPress(), MAX_PRESS_LEN));
    book.setIsbn(normalizeIsbn(book.getIsbn()));
    book.setBorrower(normalizeText(book.getBorrower(), MAX_BORROWER_LEN));
    book.setBorrowTime(trimToNull(book.getBorrowTime()));
    book.setReturnTime(trimToNull(book.getReturnTime()));
}

private Result<Void> validateBookPayload(Book book, boolean requireId) {
    if (requireId && book.getId() == null) {
        return Results.fail("图书信息不完整。", "请刷新页面后重试。");
    }
    if (trimToNull(book.getName()) == null) {
        return Results.fail("图书名称不能为空。", "请填写图书名称。");
    }
    if (trimToNull(book.getIsbn()) == null || !book.getIsbn().matches("\\\\d{13}")) {
        return Results.fail("ISBN 必须为 13 位数字。", "请检查 ISBN 是否完整。");
    }
    if (trimToNull(book.getPress()) == null) {
        return Results.fail("出版社不能为空。", "请填写出版社。");
    }
    if (trimToNull(book.getAuthor()) == null) {
        return Results.fail("作者不能为空。", "请填写作者信息。");
    }
    if (book.getPagination() == null || book.getPagination() <= 0) {
        return Results.fail("页数必须大于 0。", "请填写正确页数。");
    }
    if (book.getPrice() == null || book.getPrice() < 0) {
        return Results.fail("价格不能为负数。", "请填写正确价格。");
    }
    String status = trimToNull(book.getStatus());
    if (status == null) {
        book.setStatus("0");
    } else if (!status.matches("[0-3]")) {
        book.setStatus("0");
    } else if (!requireId && ("1".equals(status) || "2".equals(status))) {
        book.setStatus("0");
    }
    return null;
}

private Result<Void> validateBorrowRequest(Book book) {
    if (book.getId() == null || book.getId() <= 0) {
        return Results.fail("请选择需要借阅的图书。", "请从列表重新发起借阅。");
    }
    String returnTime = trimToNull(book.getReturnTime());
    if (returnTime == null) {
        return Results.fail("请选择归还日期。", "请在借阅弹窗内选择归还日期。");
    }
    if (!returnTime.matches("\\\\d{4}-\\\\d{2}-\\\\d{2}")) {
        return Results.fail("归还日期格式不正确。", "请选择正确的归还日期。");
    }
    try {
        LocalDate selected = LocalDate.parse(returnTime, DATE_FORMAT);
        LocalDate today = LocalDate.now();
        if (selected.isBefore(today)) {
            return Results.fail("归还日期不能早于今天。", "请重新选择归还日期。");
        }
        if (selected.isAfter(today.plusDays(MAX_BORROW_DAYS))) {
            return Results.fail("归还日期过远。", "请选择 90 天内的日期。");
        }
        book.setReturnTime(returnTime);
    } catch (DateTimeParseException e) {
        return Results.fail("归还日期解析失败。", "请重新选择日期。");
    }
    return null;
}

private String normalizeText(String value, int maxLen) {
    String trimmed = trimToNull(value);
    if (trimmed == null) {
        return null;
    }
    String collapsed = trimmed.replaceAll("\\\\s+", " ");
    if (collapsed.length() > maxLen) {
        return collapsed.substring(0, maxLen);
    }
    return collapsed;
}

private String normalizeIsbn(String value) {
    String trimmed = trimToNull(value);
    if (trimmed == null) {
        return null;
    }
    String digits = trimmed.replaceAll("\\\\D", "");
    if (digits.length() > 13) {
        digits = digits.substring(0, 13);
    }
    return digits.isEmpty() ? null : digits;
}

private boolean isAdmin(User user) {
    return user != null && "ADMIN".equals(user.getRole());
}

private int normalizePageNum(Integer pageNum) {
    int num = pageNum == null ? 1 : pageNum;
    return Math.max(num, 1);
}

private int normalizePageSize(Integer pageSize) {
    int size = pageSize == null ? DEFAULT_PAGE_SIZE : pageSize;
    if (size < 1) {
        return DEFAULT_PAGE_SIZE;
    }
    return Math.min(size, MAX_PAGE_SIZE);
}

private String trimToNull(String value) {
    if (value == null) {
        return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
}

}

