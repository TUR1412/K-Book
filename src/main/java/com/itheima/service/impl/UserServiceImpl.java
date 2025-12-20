package com.itheima.service.impl;
import com.itheima.domain.User;
import com.itheima.mapper.UserMapper;
import com.itheima.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/**
 *用户接口实现类
 */
@Service
public class UserServiceImpl  implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    //注入userMapper
    @Autowired
    private UserMapper userMapper;
    //通过User的用户账号和用户密码查询用户信息
    @Override
    public User login(User user) {
        if (user == null) {
            return null;
        }
        if (user.getEmail() == null || user.getPassword() == null) {
            return null;
        }
        try {
            return userMapper.login(user);
        } catch (Exception ex) {
            logger.error("用户登录查询失败", ex);
            return null;
        }
    }
}
