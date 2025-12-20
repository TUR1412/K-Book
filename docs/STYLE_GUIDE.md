# UI 样式指南

## 设计原则
- 玻璃拟态 + 轻质感阴影，保持层级清晰
- 文字与背景对比度符合 WCAG AA
- 统一使用主题变量进行颜色与间距配置

## 组件规范
- 按钮：主按钮使用主色，次级使用描边
- 表格：保留斑马纹与悬浮提示
- 空状态：使用插画 + 引导文案
- 徽章：筛选计数使用 `filter-count`，避免信息过载
- 快捷键：使用 `kbd` 组件展示组合键
- 帮助面板：`help-panel` + `help-card` 用于快捷键引导
- 骨架屏：`skeleton` 作为加载占位
- 页面加载：`page-loading` + `loading-spinner` 提供全局加载反馈
- 仪表盘：`kpi-value` 支持 skeleton 过渡后填充
- 指标徽章：`kpi-inline` 用于轻量计数展示
- 仪表盘刷新：`summary-refresh` + `summary-updated` 用于数据刷新反馈
- 刷新按钮：使用 `btn.is-loading` 提示刷新中状态
- 徽章弱化：`badge-muted` 用于状态提示补充
- 输入统计：`input-meta` + `char-count` 用于字符长度提示
- 表格工具：`data-export-table` + `data-table-count` 组合展示导出与本页数量
- 输入规范：`data-normalize`/`data-digits-only`/`data-decimal`/`data-lowercase` 进行前端归一化

## 动效规范
- 页面进入：轻量上移 + 渐显
- 强调动作：仅在主按钮触发光扫
- 复制反馈：`copyable` 使用轻量浮层提示
