# 基于官方的 Tomcat 9 + JDK 17（Servlet 4.x）
FROM tomcat:9.0-jdk17-temurin

# 创建目标目录以防止路径错误
RUN mkdir -p /usr/local/tomcat/webapps/

# 将 WAR 文件复制到 Tomcat 的 webapps 目录
COPY ./target/*.war /usr/local/tomcat/webapps/cloudlibrary.war

# 暴露 Tomcat 的 HTTP 端口
EXPOSE 8080

# 启动 Tomcat
CMD ["catalina.sh", "run"]
