# 版本管理

正式版本从 `v0.1.0` 开始。早期 `v0.3.0` tag 属于开发阶段误命名，保留作历史记录，不再作为后续版本依据。

## 版本号规则

使用项目内部版本号，不严格套标准 semver。目标是让运营版本节奏更容易读：

- 功能小版本：新增功能或明显体验变化，例如 `v0.1.3`、`v0.1.4`
- 子修订版本：修 bug、文案、小样式、交互微调，例如 `v0.1.31`、`v0.1.32`
- 次版本：阶段性功能包或比较完整的一轮迭代，例如 `v0.2.0`
- 主版本：重大架构变化或公开稳定版，例如 `v1.0.0`

例子：`v0.1.3` 是“活动头图”功能版本；如果后续只是修它的小 bug，就用 `v0.1.31`，而不是直接跳到 `v0.1.4`。

早期已经推送过的 tag 不回改、不删除，避免破坏历史留档。从这条规则更新后开始按新方式走。

## 发布前检查

```bash
git status --short
npm run check
```

确认没有 `.env.local`、`.DS_Store`、`.venv`、`.swp` 等本地文件进入暂存区。

## 发布命令

```bash
git add .
git commit -m "release: v0.1.31"
git tag -a v0.1.31 -m "v0.1.31"
git push origin main
git push origin v0.1.31
```

发布后更新 `CHANGELOG.md`，说明用户能感知到的变化。

## 查看旧版本

```bash
git tag --list "v*"
git show --stat v0.1.0
git checkout v0.1.0
```

只查看旧版本时不要在 detached HEAD 上直接开发。需要修改旧版本时，先建分支：

```bash
git checkout -b fix/from-v0.1.0 v0.1.0
```
