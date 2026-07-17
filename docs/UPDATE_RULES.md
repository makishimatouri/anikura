# 文档与项目上下文更新规范

这份规范保证 GitHub 仓库始终能作为 cnanikura 的交接入口。以后把仓库地址交给新的 Agent 时，Agent 应先读根目录 `AGENTS.md`、`docs/INDEX.md` 和 `docs/PROJECT_GUIDE.md`，再按任务读取专题文档。

## 1. 谁是事实源

文档不保存密码、密钥、个人账号、后台截图或依赖某台电脑的绝对路径。事实来源按以下优先级判断：

1. 当前用户本轮明确提供的资料。
2. 当前工作区的真实文件、Git 状态和当前代码。
3. 当前线上只读探测结果。
4. Supabase、Vercel、Cloudflare、GoDaddy、GitHub 控制台当前显示的状态。
5. 历史 CHANGELOG、旧 commit、旧对话和记忆。

历史内容只能作为线索。无法重新核验的内容写成“历史确认”或“待确认”，不能写成当前事实。

## 2. 文件应该怎么分工

同一事实只保留一个主要出处，其他文件用链接引用，不要复制出多个互相漂移的版本。

| 文件 | 负责记录什么 | 触发更新的情况 |
| --- | --- | --- |
| `AGENTS.md` | Agent 行为、安全边界、计算结果格式、不可破坏约束 | Agent 规则或安全边界改变 |
| `README.md` | 项目简介、启动方式、技术栈和公开文档入口 | 新人启动方式或项目范围改变 |
| `docs/INDEX.md` | 所有维护文档的入口和阅读顺序 | 新增、删除、改名文档 |
| `docs/PROJECT_GUIDE.md` | 当前版本、已关闭、待办、踩坑、线上快照 | 每轮阶段性工作、发布或事故结束 |
| `docs/ARCHITECTURE.md` | 路由、组件、数据流、权限、数据库对象 | 代码结构、权限或数据流改变 |
| `docs/OPERATIONS.md` | 五个外部服务的职责、后台维护、故障分层 | 服务拓扑、账号边界或维护流程改变 |
| `docs/DEPLOYMENT.md` | Preview、Production、域名核验、回滚 | 部署链路、域名或回滚方式改变 |
| `docs/METHODS.md` | 计算公式、筛选条件、数据校验和报告格式 | 业务规则、计算方法或验证口径改变 |
| `docs/VERSIONING.md` | 分支、tag、Release、版本和归档 | 版本策略或发布流程改变 |
| `docs/MAINTENANCE.md` | 日常、每周、发布和事故清单 | 维护节奏或检查项目改变 |
| `CHANGELOG.md` | 用户可感知的版本变化 | 用户能看到的功能、文案或行为改变 |
| `.github/PULL_REQUEST_TEMPLATE.md` | 每个 PR 必须填写的事实、风险、计算和验证项 | PR 质量门槛改变 |

## 3. 每次任务开始前

先确认仓库和版本，再动文件：

```bash
git rev-parse --show-toplevel
git status --short --branch
git remote -v
git fetch origin
git log --oneline --decorate -12
```

然后阅读：

```text
AGENTS.md
docs/INDEX.md
docs/PROJECT_GUIDE.md
与任务相关的专题文档
```

如果工作区已有修改，先记录它们并保留，不要用 reset、checkout 或清理命令覆盖。

## 4. 修改时的同步规则

### 只改文档

- 先更新对应的专题文档。
- 如果新增或改名文件，同步 `docs/INDEX.md` 和 README 文档入口。
- 如果改变 Agent 行为，同步 `AGENTS.md`。
- 如果用户可感知，同步 `CHANGELOG.md` 的 `Unreleased`。
- 如果改变当前状态，同步 `docs/PROJECT_GUIDE.md` 的状态快照、已关闭或待办。

### 改业务代码

按影响范围同步：

- 路由、组件、权限或数据流：`docs/ARCHITECTURE.md`。
- Supabase schema、RLS、Auth 或 Storage：migration、`docs/OPERATIONS.md`、`docs/DEPLOYMENT.md`，并记录执行状态。
- 计算、积分、库存、日期或筛选：`docs/METHODS.md`，写明公式、输入、结果和校验。
- 发布、环境变量、DNS 或回滚：`docs/DEPLOYMENT.md`、`docs/OPERATIONS.md`。
- 用户可见变化：`CHANGELOG.md`。

不要把“代码已经写好”写成“生产已经生效”。生产状态必须由部署记录或线上探测证明。

### 更新待办

- 已完成：从“待处理”移到“已关闭”，写完成日期、commit/tag、验证结果。
- 未完成：保留在“待处理”，写原因和下一步。
- 无法核验：标为“待确认”，不要猜测。
- 已过时：删除或改成历史说明，避免旧待办一直堆积。

## 5. 校验和提交规则

### 文档变更至少检查

```bash
git diff --check
git status --short
git diff --cached --check
```

### 业务代码变更必须检查

```bash
npm run check
```

报告中分别写 `typecheck`、`lint`、`build` 和线上 smoke test 的结果。Warning 要保留，不要写成“全部无问题”。

### GitHub 归档流程

```text
main 拉取最新
  -> codex/<purpose> 独立分支
  -> 本地检查
  -> 推送分支
  -> GitHub PR
  -> CI 与 Vercel Preview 通过
  -> 合并 main
  -> 核对 main、线上和 PROJECT_GUIDE
```

直接推送 `main` 可能触发 Vercel 生产部署。涉及生产的合并要提前说明影响；数据库、DNS、环境变量、权限和密钥操作另行确认。

## 6. 版本与 CHANGELOG

- 文档日常改造先写在 `CHANGELOG.md` 的 `Unreleased`，不因为改 Markdown 自动增加 `package.json` 版本。
- 只有明确要形成对外版本快照时才打 tag 和 GitHub Release。
- 每次正式发布要记录 commit、tag、Release、检查结果、线上状态和回滚点。
- 不删除、不移动、不重写已有 tag；`v0.3.0` 继续作为历史误命名保留。

## 7. 交接最低标准

只给 GitHub 仓库地址时，新的 Agent 应能完成以下动作：

1. 读 `AGENTS.md`，知道怎样工作和怎样报告结果。
2. 读 `docs/INDEX.md`，知道其他文档在哪。
3. 读 `docs/PROJECT_GUIDE.md`，知道当前版本、已完成和待处理事项。
4. 用 `git remote -v`、`git status` 和当前文件重新核对，不依赖旧路径。
5. 任务结束时更新必要文档，并留下可验证的 commit/PR。

## 8. 一次更新记录模板

```text
日期：YYYY-MM-DD HH:mm Asia/Shanghai
任务：
依据：当前文件 / 用户资料 / 控制台 / 线上探测
更新文件：
事实变化：
已关闭：
新增待办：
验证：命令、状态码、检查结果
版本：当前 commit / tag / Release
风险：是否触发 Preview、Production、数据库或外部服务变化
```
