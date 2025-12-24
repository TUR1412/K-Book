package com.itheima.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;

import javax.sql.DataSource;

/*
等同于
<context:property-placeholder location="classpath*:jdbc.properties"/>
 */
@PropertySource("classpath:jdbc.properties")
public class JdbcConfig {
    /*
    使用注入的形式，读取properties文件中的属性值，
    等同于<property name="*******" value="${jdbc.driver}"/>
     */
    @Value("${jdbc.driverClassName}")
    private String driver;
    @Value("${jdbc.url}")
    private String url;
    @Value("${jdbc.username}")
    private String userName;
    @Value("${jdbc.password}")
    private String password;

    /*定义dataSource的bean，
    等同于<bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
     */
    @Bean("dataSource")
    public DataSource getDataSource(){
        HikariConfig config = new HikariConfig();
        config.setDriverClassName(driver);
        config.setJdbcUrl(url);
        config.setUsername(userName);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setPoolName("kbook-hikari");
        config.setConnectionTimeout(10_000);
        config.setValidationTimeout(3_000);
        config.setIdleTimeout(60_000);
        config.setMaxLifetime(10 * 60_000);
        return new HikariDataSource(config);
    }
}

