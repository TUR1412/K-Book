package com.itheima.controller;
import com.itheima.domain.Record;
import com.itheima.domain.User;
import com.itheima.service.RecordService;
import entity.PageResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.servlet.http.HttpServletRequest;
@Controller
@RequestMapping("/record")
public class RecordController {
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_BORROWER_LEN = 40;
    private static final int MAX_BOOKNAME_LEN = 80;
    private static final Logger logger = LoggerFactory.getLogger(RecordController.class);
    @Autowired
    private RecordService recordService;
/**
 * 查询借阅记录
 * @param record 借阅记录的查询条件
 * @param pageNum 当前页码
 * @param pageSize 每页显示数量
 */
@RequestMapping("/searchRecords")
public ModelAndView searchRecords(Record record, HttpServletRequest request, Integer pageNum, Integer pageSize){
    pageNum = normalizePageNum(pageNum);
    pageSize = normalizePageSize(pageSize);
    //获取当前登录用户的信息
    User user = ((User) request.getSession().getAttribute("USER_SESSION"));
    if (user == null) {
        request.setAttribute("msg", "您还没有登录，请先登录！");
        return new ModelAndView("forward:/admin/login.jsp");
    }
    sanitizeRecord(record);
    PageResult pageResult;
    try {
        pageResult=recordService.searchRecords(record,user,pageNum,pageSize);
    } catch (Exception ex) {
        logger.error("查询借阅记录失败", ex);
        request.setAttribute("msg", "查询记录失败，请稍后再试。");
        return new ModelAndView("forward:/admin/record.jsp");
    }
    ModelAndView modelAndView=new ModelAndView();
    modelAndView.setViewName("record");
    //将查询到的数据存放在 ModelAndView的对象中
    modelAndView.addObject("pageResult",pageResult);
    //将查询的参数返回到页面，用于回显到查询的输入框中
    modelAndView.addObject("search",record);
    //将当前页码返回到页面，用于分页插件的分页显示
    modelAndView.addObject("pageNum",pageNum);
    //将当前查询的控制器路径返回到页面，页码变化时继续向该路径发送请求
    modelAndView.addObject("gourl", request.getRequestURI());
    return modelAndView;
}

private void sanitizeRecord(Record record) {
    if (record == null) {
        return;
    }
    record.setBookname(normalizeText(record.getBookname(), MAX_BOOKNAME_LEN));
    record.setBorrower(normalizeText(record.getBorrower(), MAX_BORROWER_LEN));
    record.setBookisbn(trimToNull(record.getBookisbn()));
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

private String trimToNull(String value) {
    if (value == null) {
        return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
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
}

