# 基于官方的 Tomcat 8 镜像
FROM tomcat:8

# 创建目标目录以防止路径错误
RUN mkdir -p /usr/local/tomcat/webapps/

# 将 WAR 文件复制到 Tomcat 的 webapps 目录
COPY ./target/cloudlibrary-1.0-SNAPSHOT.war /usr/local/tomcat/webapps/cloudlibrary.war

# 暴露 Tomcat 的 HTTP 端口
EXPOSE 8080

# 启动 Tomcat
CMD ["catalina.sh", "run"]
