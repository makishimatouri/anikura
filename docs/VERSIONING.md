# 版本管理与归档规范

## 版本线

正式版本从 `v0.1.0` 开始。当前代码版本是 `v0.1.54`。历史 `v0.3.0` 属于开发阶段误命名，保留在仓库中但不作为后续版本依据。

现有归档含义：

| 版本 | 含义 |
| --- | --- |
| `v0.1.0` | 基础功能稳定基线 |
| `v0.1.1` | README、docs、CI、ESLint 和仓库协作规范化 |
| `v0.1.2`–`v0.1.5` | 精选、头图、移动端轮播和移动端首页功能 |
| `v0.1.41`–`v0.1.44` | 精选推荐展示和后台控制修正 |
| `v0.1.51`–`v0.1.54` | 移动端首页标题、渐变和文案调整 |
| `v0.3.0` | 历史开发版本，非正式线 |

不删除或移动已有 tag，不重写已经推送的历史。版本文件和 GitHub Release 由 tag 绑定，commit history 负责提供更细的回滚点；GitHub Projects 只管理任务。

## 版本号选择

本项目沿用运营友好的内部编号，不强行把所有历史版本解释成严格 semver：

- 新功能或明显页面行为变化：`v0.1.5` 这类功能小版本。
- bug、文案、样式、局部交互：`v0.1.51` 这类子修订版本。
- 一组完整阶段性功能：`v0.2.0`。
- 重大架构变化或公开稳定版：`v1.0.0`。

版本判断必须写清楚“为什么是这个级别”，不能只按当前数字递增。文档改造是否单独打正式 tag，需要结合是否进入生产、是否影响使用和用户要求决定；不要为了有数字而打 tag。

## 推荐发布流程

### 1. 建立独立分支

```bash
git switch main
git pull --ff-only
git switch -c codex/<short-purpose>
```

如果工作区不干净，先记录并保留现有改动，不要强行切换或清理。

### 2. 修改和验证

```bash
git diff --check
npm run check
git status --short
```

如果涉及数据库、环境变量、DNS 或权限，先按 `docs/OPERATIONS.md` 走风险确认，不要把代码通过当作线上安全。

### 3. 写变更记录

在 `CHANGELOG.md` 的 `Unreleased` 或对应版本下写用户可感知的变化。数据库 migration、配置变化、已知 warning 和回滚点要单独写。

### 4. 提交

```bash
git add AGENTS.md README.md CHANGELOG.md docs .github/PULL_REQUEST_TEMPLATE.md
git diff --cached --check
git commit -m "docs: establish project maintenance handoff"
```

提交前确认没有 `.env.local` 或其他忽略文件被强行加入。

### 5. 预览和合并

```bash
git push -u origin codex/<short-purpose>
```

查看 GitHub CI 和 Vercel Preview，确认页面、日志和数据读取。通过 PR 合并到 `main`。向 `main` 推送或合并可能触发生产部署，属于需要提前告知的外部操作。

### 6. 打 tag 和 Release

只有在版本内容、线上状态和 `CHANGELOG.md` 都确认后再创建 annotated tag：

```bash
git switch main
git pull --ff-only
git tag -a v0.1.xx -m "v0.1.xx <short description>"
git push origin v0.1.xx
```

然后在 GitHub Releases 中选择这个 tag，写明：

- 用户可见变化。
- 数据库和环境变量变化。
- 验证结果。
- 已知问题。
- 回滚方式。

不要把本地 commit、GitHub tag 和 GitHub Release 混成一个概念：commit 可以很多，tag 是版本锚点，Release 是对外说明页。

## 回滚

### 查看历史

```bash
git fetch --tags
git tag --list "v*" --sort=version:refname
git show --stat v0.1.0
git log --oneline --decorate --all -30
```

### 从 tag 建修复分支

```bash
git switch -c fix/from-v0.1.54 v0.1.54
```

只查看旧版本可以 detached HEAD；要修改必须先建分支。不要删除 tag、强推覆盖历史或用数据库回滚代替前端回滚。

### 线上回滚层次

1. 首选 Vercel 上一条成功 Deployment，速度快且不改 Git 历史。
2. 如果需要修代码，从已知 tag 建分支并发 Preview。
3. 数据库恢复独立于代码版本，必须有备份、数据损失评估和用户确认。
4. DNS、TLS、环境变量需要在各自平台单独回滚。

## 归档检查

每个正式版本至少留下：

```text
Git commit：
Git tag：
GitHub Release：
package.json version：
CHANGELOG 条目：
npm run check：
线上 smoke test：
数据库 migration：无 / 文件名 / 执行时间待确认
环境变量：无 / 已变更但不记录值
Vercel Deployment：
回滚点：
```
