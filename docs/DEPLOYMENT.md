# 部署指南

## 本地部署
1. 初始化数据库：执行 `deploy/init.sql`
2. 配置环境变量：参考 `.env.example`
3. 打包：`mvn -DskipTests package`
4. 将生成的 `war` 部署到 Tomcat

## Docker 部署
1. 进入 `deploy` 目录
2. 启动服务：
   ```
   docker compose up -d
   ```
3. 浏览器访问 `http://localhost:8080`

## 常见问题
- 数据库连接失败：确认端口与账号密码配置
- 页面样式未更新：确认静态资源版本号已更新
