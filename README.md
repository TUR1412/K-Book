# K-Book 云借阅图书管理系统

> 现代化的图书借阅管理系统。强调“可读、可控、可扩展”的后台体验，聚焦高效率借阅流程与清晰的数据视图。

![Dashboard Preview](docs/preview-dashboard.svg)

![Login Preview](docs/preview-login.svg)

## 亮点特性
- 玻璃拟态 + 极光背景的全新管理后台 UI
- Bento Grid 仪表盘，关键动作一眼可见
- 借阅流程优化：借阅 / 归还 / 归还确认清晰闭环
- 统一主题与组件化布局，减少页面风格割裂
- 快捷键帮助面板与筛选计数，提升检索效率
- 登录体验增强（Caps 提示 / 密码可视 / 自动淡出提醒）
- 安全响应头默认启用，降低基础安全风险
- 页面加载遮罩与状态汇总，降低操作不确定性
- 仪表盘摘要数据动态更新
- 活跃馆藏指标卡片同步刷新
- 仪表盘支持手动刷新与更新时间提示
- 刷新按钮具备加载态与防重复点击
- 管理员写入操作具备后端权限校验
- 表单字符计数与长度限制，降低误输入
- 表格导出 CSV 与本页条数提示
- 输入归一化（空格收敛/数字净化/邮箱小写）
- 导出按钮无数据自动禁用
- 借阅归还日期后端校验（90 天内）
- 静态资源统一版本号，避免缓存导致的更新失效

## 技术栈
- Java 8 + Spring MVC + MyBatis
- JSP + Bootstrap（深度主题化）
- MySQL + Druid
- Docker Compose（可选）

## 快速开始

### 1. 数据库准备
任选其一：
- 使用 `deploy/docker-compose.yml` 启动 MySQL（自动导入 `deploy/init.sql`）
- 手动创建数据库并导入 `deploy/init.sql`

### 2. 配置环境变量
复制 `.env.example` 并根据实际环境设置，或直接在系统环境变量中配置：
```
DB_DRIVER
DB_URL
DB_USER
DB_PASSWORD
```

### 3. 构建与部署
项目为 `war` 包，可部署到外部 Servlet 容器（Tomcat/Jetty）：
```
mvn -DskipTests package
```

## 默认数据说明
初始化脚本中包含示例数据与账号信息，请根据实际需要修改密码与账号权限：
- 账号信息见 `deploy/init.sql` 的 `user` 表

## 目录结构
```
K-Book
├─ deploy/                # 部署脚本与数据库初始化
├─ docs/                  # 预览图与文档资产
├─ src/main/java/          # 后端代码
├─ src/main/resources/     # 配置与 MyBatis 映射
├─ src/main/webapp/        # JSP 与静态资源
└─ pom.xml
```

## 贡献与约定
欢迎提交 Issue 和 PR。请在提交前确保：
- UI 修改已更新资源版本号
- 数据库相关变更同步更新 `deploy/init.sql`

## 文档索引
- `docs/STYLE_GUIDE.md`：UI 样式指南
- `docs/DEPLOYMENT.md`：部署指南
- `docs/ARCHITECTURE.md`：架构概览
- `docs/FAQ.md`：常见问题
- `docs/API.md`：接口速览
- `docs/DB_SCHEMA.md`：数据结构
- `docs/ROADMAP.md`：路线图
- `CHANGELOG.md`：版本更新记录
- `CONTRIBUTING.md`：贡献流程

## License
未声明，默认保留所有权利。
