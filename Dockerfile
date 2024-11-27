FROM tomcat:8

# 将 WAR 文件复制到 Tomcat 的 webapps 目录，使用 cloudlibrary.war 作为文件名
COPY ./target/cloudlibrary-1.0-SNAPSHOT.war /usr/local/tomcat/webapps/cloudlibrary.war

# 暴露 Tomcat 默认的 HTTP 端口
EXPOSE 8080
