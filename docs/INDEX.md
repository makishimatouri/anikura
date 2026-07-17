# cnanikura 文档导航

这套文档用于让新对话快速恢复项目上下文。先读根目录 `AGENTS.md`，再读本页和 `PROJECT_GUIDE.md`，最后按任务读取专题文档。

## 入口文件

| 文件 | 用途 | 什么时候更新 |
| --- | --- | --- |
| `AGENTS.md` | Agent 行为、计算结果格式、安全边界和项目不可破坏约束 | 行为规则或安全边界变化时 |
| `README.md` | 给开发者和仓库访客看的项目总览、启动方式和文档入口 | 技术栈、启动方式、功能范围变化时 |
| `docs/PROJECT_GUIDE.md` | 当前进度、已关闭事项、待确认事项、踩坑和交接上下文 | 每轮阶段性工作完成后 |
| `docs/OPERATIONS.md` | Supabase、GoDaddy、Vercel、Cloudflare、GitHub 的职责和维护方法 | 控制台拓扑、密钥、域名或部署流程变化时 |
| `docs/ARCHITECTURE.md` | 路由、组件、数据流、权限和数据库对象 | 代码架构变化时 |
| `docs/DEPLOYMENT.md` | 本地检查、预览、生产部署、DNS 核验和回滚 | 发布流程或线上拓扑变化时 |
| `docs/METHODS.md` | 筛选、日期、积分、图片、质量检查和报告格式等可复用方法 | 计算规则或验证标准变化时 |
| `docs/VERSIONING.md` | Git 分支、tag、GitHub Release、变更记录和回滚规范 | 版本号或归档方式变化时 |
| `docs/MAINTENANCE.md` | 日常、每周、发布前和事故后的维护清单 | 维护节奏或检查项目变化时 |
| `docs/UPDATE_RULES.md` | 文档分工、更新时机、同步规则和 GitHub 交接流程 | 文档结构或长期更新流程变化时 |
| `docs/HANDOFF_TEMPLATE.md` | 新对话的上下文提示模板 | 交接字段变化时 |
| `CHANGELOG.md` | 用户可感知的版本变化 | 每次发布或明确的用户可见变更时 |

## 最短接手路径

```text
AGENTS.md
  -> docs/PROJECT_GUIDE.md
  -> docs/OPERATIONS.md（涉及线上服务时）
  -> docs/ARCHITECTURE.md（涉及代码时）
  -> docs/METHODS.md（涉及计算或数据时）
  -> docs/UPDATE_RULES.md（涉及文档更新或交接时）
  -> docs/VERSIONING.md + docs/MAINTENANCE.md（涉及发布或归档时）
```

## 文档事实等级

- **已确认**：当前仓库、命令输出或本轮只读线上检查直接证明。
- **历史确认**：过去部署或维护时确认过，但本轮没有登录相应控制台复核。
- **建议**：为了降低风险而提出的流程，不代表当前已经启用。
- **待确认**：必须登录服务后台、核对业务资料或由用户做决定。

文档中的服务账号、项目 ID、密钥、个人邮箱和本地绝对路径不作为上下文保存。需要操作时，从当前控制台、当前环境变量和 `git remote -v` 重新确认。
