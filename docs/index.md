# 文档入口（交互式导航）

> 推荐阅读路径：`index.md` → `ARCHITECTURE.md` → `DEPLOYMENT.md` → `API.md` → `FAQ.md`

## 快速索引
- 架构：`ARCHITECTURE.md`
- 部署：`DEPLOYMENT.md`
- 接口：`API.md`
- 数据库：`DB_SCHEMA.md`
- UI 规范：`STYLE_GUIDE.md`
- 路线图：`ROADMAP.md`
- 常见问题：`FAQ.md`

---

<details>
<summary><strong>架构一图流（多维层级）</strong></summary>

```mermaid
flowchart TB
  subgraph Client[客户端 / Browser]
    UI[JSP 页面 + 静态资源]
    Net[kbApi：拦截/超时/重试/进度条]
    UI --> Net
  end

  subgraph Server[服务端 / Tomcat + Spring MVC]
    Filter[Filter: 编码 & 安全响应头]
    Ctrl[Controller: 路由 & 参数校验]
    Svc[Service: 业务逻辑 & 事务]
    Mapper[MyBatis Mapper: SQL]
    Filter --> Ctrl --> Svc --> Mapper
  end

  subgraph Data[数据层]
    DB[(MySQL)]
  end

  Net -->|HTTP JSON / Form| Ctrl
  Mapper --> DB
```

</details>

<details>
<summary><strong>借阅链路（时序）</strong></summary>

```mermaid
sequenceDiagram
  participant U as User
  participant P as Page(JS)
  participant C as Controller
  participant S as Service
  participant M as Mapper
  participant DB as MySQL

  U->>P: 点击“借阅”
  P->>P: kbApi 进入请求闭环（loading/超时/重试）
  P->>C: POST /book/borrowBook
  C->>S: borrowBook(...)
  S->>M: update status / write record
  M->>DB: SQL
  DB-->>M: OK
  M-->>S: 影响行数
  S-->>C: Result
  C-->>P: JSON(Result)
  P-->>U: Toast + 跳转/刷新
```

</details>

---

## 交互式阅读提示
- Mermaid 图：GitHub 会自动渲染（建议在仓库页面直接查看）。
- `<details>` 可折叠：适合把“概览”与“细节”放在同一页，读起来更不累。

