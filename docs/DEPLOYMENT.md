# 部署说明

线上部署使用 Vercel，域名解析和 CDN 使用 Cloudflare，数据服务使用 Supabase。

## 环境变量

Vercel Project Settings 里需要配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` 是高权限密钥，只能放在服务端环境变量里，不要写进仓库、Issue、README、截图或聊天记录。

## 部署流程

1. 本地确认检查通过：

   ```bash
   npm run check
   ```

2. 提交并推送到 `main`。

3. Vercel 自动部署。

4. 部署完成后检查：

   - `https://www.anikura.cn`
   - `/events`
   - `/anirox`
   - `/auth/login`
   - `/admin/login`

## 域名

- 主域名：`www.anikura.cn`
- 根域名：`anikura.cn`，由 Vercel 做 308 跳转到 `www.anikura.cn`
- Cloudflare SSL/TLS 模式：Full

Cloudflare 的 DNS 记录以 Vercel 域名验证状态为准。看到 Vercel 的 “DNS Change Recommended” 不一定是错误，只要域名状态为 Valid Configuration 且网站可访问即可。

## 回滚

如果新版本上线后出问题，优先在 Vercel 里回滚到上一条成功 Deployment。代码层面可用 tag 找回：

```bash
git fetch --tags
git checkout v0.1.0
```

不要删除 Supabase 数据来修复前端问题。数据库改动需要先备份。
