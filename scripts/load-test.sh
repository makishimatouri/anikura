#!/usr/bin/env bash
# anikura.cn 全量发布前压测脚本
# 默认打 codex/gray-entry 分支的预览部署（与当前生产同一份老版构建，无门禁、不碰正式站流量）。
# 用法：bash scripts/load-test.sh [目标URL]
# 依赖：npx autocannon（首次运行自动下载）；GitHub/npm 拉不动时先走代理（见 AGENTS.md 网络节）。
set -euo pipefail

BASE="${1:-https://anikura-e472d8gd9-touri114.vercel.app}"

echo "目标: $BASE"
echo "== 1/3 首页（20 并发 × 30 秒）=="
npx --yes autocannon -c 20 -d 30 "$BASE/"

echo "== 2/3 活动列表 /events（20 并发 × 30 秒）=="
npx --yes autocannon -c 20 -d 30 "$BASE/events"

echo "== 3/3 投稿页 /checkin（10 并发 × 20 秒，读页面不写库）=="
npx --yes autocannon -c 10 -d 20 "$BASE/checkin"

cat << 'NOTE'

判读要点：
- 关注 p95/p99 延迟、req/sec、是否有 non-2xx。海报图片走 Supabase Storage CDN，不在本脚本覆盖范围。
- 本脚本只读不写。投稿并发写入需要登录态，属于另一类测试，需要时单独设计。
- 想打灰度站（新版）就把目标换成 https://gray.anikura.cn/ ，但非管理员请求只会打到门禁墙，
  测的是门禁路径而不是真实页面，注意区分。
NOTE
