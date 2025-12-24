package com.itheima.controller;
import com.itheima.domain.User;
import com.itheima.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
/**
 * 用户登录和注销Controller
 */
@Controller
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    @RequestMapping("/toMainPage")
    public String  toMainPage(){
        return "main";
    }
    //注入userService
    @Autowired
    private UserService userService;
    /*
   用户登录
    */
    @RequestMapping("/login")
    public String login(User user, HttpServletRequest request){
        try {
            if (user == null || !StringUtils.hasText(user.getEmail()) || !StringUtils.hasText(user.getPassword())) {
                request.setAttribute("msg","请输入账号与密码");
                return  "forward:/admin/login.jsp";
            }
            user.setEmail(user.getEmail().trim().toLowerCase());
            User u=userService.login(user);
            /*
            用户账号和密码是否查询出用户信息
                是：将用户信息存入Session，并跳转到后台首页
                否：Request域中添加提示信息，并转发到登录页面
             */
            if(u!=null){
                // 防止 Session Fixation：登录成功后刷新 Session
                HttpSession existing = request.getSession(false);
                if (existing != null) {
                    existing.invalidate();
                }
                HttpSession session = request.getSession(true);
                session.setAttribute("USER_SESSION",u);
                return "redirect:/admin/main.jsp";
            }
            request.setAttribute("msg","用户名或密码错误");
            return  "forward:/admin/login.jsp";
        }catch(Exception e){
            logger.error("登录异常", e);
            request.setAttribute("msg","系统错误");
            return  "forward:/admin/login.jsp";
        }
    }
/*
注销登录
 */
@RequestMapping("/logout")
public String logout( HttpServletRequest request){
    try {
        HttpSession session = request.getSession();
        //销毁Session
        session.invalidate();
        return  "forward:/admin/login.jsp";
    }catch(Exception e){
        logger.error("注销异常", e);
        request.setAttribute("msg","系统错误");
        return  "forward:/admin/login.jsp";
    }
}
}
