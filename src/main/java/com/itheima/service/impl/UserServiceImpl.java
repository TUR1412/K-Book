package com.itheima.service.impl;
import com.itheima.domain.User;
import com.itheima.mapper.UserMapper;
import com.itheima.service.UserService;
import com.itheima.util.PasswordHasher;
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
            String email = user.getEmail().trim().toLowerCase();
            String rawPassword = user.getPassword();
            User stored = userMapper.findByEmail(email);
            if (stored == null) {
                return null;
            }
            String storedPassword = stored.getPassword();
            boolean matched = PasswordHasher.matches(rawPassword, storedPassword);
            if (!matched) {
                return null;
            }

            // 兼容旧数据：明文口令匹配后自动升级为 PBKDF2 哈希
            if (storedPassword != null) {
                String trimmed = storedPassword.trim();
                if (!trimmed.isEmpty() && !trimmed.startsWith("pbkdf2_sha256$")) {
                    try {
                        userMapper.updatePassword(stored.getId(), PasswordHasher.hash(rawPassword));
                    } catch (Exception ex) {
                        logger.warn("用户口令升级失败: userId={}", stored.getId(), ex);
                    }
                }
            }

            stored.setPassword(null);
            return stored;
        } catch (Exception ex) {
            logger.error("用户登录查询失败", ex);
            return null;
        }
    }
}
