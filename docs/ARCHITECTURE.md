# 架构概览

## 模块划分
- Web 层：JSP + 统一布局片段
- Service 层：业务逻辑与事务
- Mapper 层：MyBatis 数据访问
- 资源层：CSS/JS/图片与主题
- Filter 层：编码统一与安全响应头

## 请求链路
1. Controller 接收请求
2. Service 处理业务
3. Mapper 访问数据库
4. JSP 渲染视图

## 仪表盘摘要
- `BookController#summary` → `BookService#getSummary` → `BookMapper#countByStatus*`

## 关键文件
- `src/main/java/com/itheima/controller/*`
- `src/main/java/com/itheima/service/*`
- `src/main/java/com/itheima/mapper/*`
- `src/main/webapp/admin/*`
