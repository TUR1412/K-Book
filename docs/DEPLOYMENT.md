# 部署指南

## 本地部署
1. 初始化数据库：执行 `deploy/init.sql`
2. 配置环境变量：参考 `.env.example`
3. 打包（推荐 Maven Wrapper）：
   - Windows：`.\mvnw.cmd -DskipTests package`
   - macOS/Linux：`./mvnw -DskipTests package`
4. 将生成的 `war` 部署到 Tomcat 9（JDK 17）

> 说明：本项目默认使用 PBKDF2-SHA256 存储用户口令，初始化脚本已将 `user_password` 字段扩展到 `varchar(255)`。
> 若你基于旧数据库升级，请先执行一次 `ALTER TABLE user MODIFY user_password varchar(255);`

## Docker 部署
1. 进入项目根目录，先构建镜像（或按你的 CI 镜像流程生成镜像）
2. 进入 `deploy` 目录并启动服务：
   ```
   docker compose up -d
   ```
3. 浏览器访问 `http://localhost:8080`

## 常见问题
- 数据库连接失败：确认端口与账号密码配置
- 页面样式未更新：确认静态资源版本号已更新
