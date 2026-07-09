# 版本管理

正式版本从 `v0.1.0` 开始。早期 `v0.3.0` tag 属于开发阶段误命名，保留作历史记录，不再作为后续版本依据。

## 版本号规则

使用 `v主版本.次版本.修订版本`：

- 修订版本：修 bug、文案、小样式，例如 `v0.1.1`
- 次版本：新增功能或明显体验变化，例如 `v0.2.0`
- 主版本：重大架构变化或公开稳定版，例如 `v1.0.0`

## 发布前检查

```bash
git status --short
npm run check
```

确认没有 `.env.local`、`.DS_Store`、`.venv`、`.swp` 等本地文件进入暂存区。

## 发布命令

```bash
git add .
git commit -m "release: v0.1.1"
git tag -a v0.1.1 -m "v0.1.1"
git push origin main
git push origin v0.1.1
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
