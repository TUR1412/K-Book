# API 速览

## 通用响应
JSON 响应统一包含：
- `success`：操作是否成功
- `message`：提示信息
- `actionableSuggestion`：可执行的建议（可选）
- `data`：业务数据（可选）

## 登录
- `POST /login`：用户登录
- `GET /logout`：退出登录

## 图书
- `GET /book/selectNewbooks`：新书推荐
- `GET /book/summary`：仪表盘摘要数据
  - 返回字段：`returning`、`borrowed`、`available`、`active`
  - 需登录（管理员/读者均可访问）
- `POST /book/search`：图书检索
- `POST /book/addBook`：新增图书（管理员）
- `POST /book/editBook`：编辑图书（管理员）
- `POST /book/borrowBook`：借阅图书
  - `returnTime` 必填，格式 `yyyy-MM-dd`，需为今天至 90 天内
- `GET /book/returnBook`：归还图书
- `GET /book/returnConfirm`：归还确认（管理员）

## 借阅记录
- `POST /record/searchRecords`：查询记录
