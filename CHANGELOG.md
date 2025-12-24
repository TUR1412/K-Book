# 变更日志

本项目遵循语义化版本与可读变更记录。

## [Unreleased]
- Frontend: 移除 jQuery/Bootstrap 运行时依赖，改为原生 JS（fetch + 事件委托）与自研 Modal
- Security: 登录口令升级为 PBKDF2-SHA256（支持旧明文自动升级），并清理部署脚本中的明文 Token
- Build: 引入 Maven Wrapper，升级 Spring/MyBatis/Jackson 等依赖并将日志框架切换为 Logback
- Deploy: Dockerfile 升级到 Tomcat 9 + JDK 17，CI 使用 Wrapper 构建
- UI：快捷键帮助、筛选计数与登录体验强化
- A11y：分页 aria-current 与键盘交互完善
- Security：基础响应头默认启用
- API：actionableSuggestion 响应字段补齐
- UX：页面加载遮罩与状态汇总统计
- Data：仪表盘摘要接口新增
- Dashboard：活跃馆藏指标与前端拉取
- Dashboard：支持手动刷新与更新时间提示
- Dashboard：刷新按钮加载态与防重复点击
- Security：管理员操作后端权限校验
- UX：表单字符计数与输入长度限制
- UX：表格导出 CSV 与本页条数提示
- UX：输入归一化（空格收敛、数字净化、邮箱小写）
- Security：响应头补齐与动态页面 no-store
- UX：导出按钮无数据自动禁用
- Backend：借阅归还日期 90 天内校验
- Perf：合并滚动监听为 rAF 调度，降低高频滚动抖动与回调开销
- Perf：表格行入场动画仅对前 10 行生效，避免大页动画合成成本
- Perf：管理端诊断/虚拟滚动脚本改为按需加载，`kbHealth()` 仍可直接使用
- Perf：管理端脚本统一使用 `defer`，减少解析阻塞并提升交互可用时间

## [1.0.0] - 2025-12-20
- 初始版本发布
