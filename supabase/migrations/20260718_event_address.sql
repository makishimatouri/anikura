-- 活动具体地址单列：venue 只放场地名，address 放门牌地址
-- 已于 2026-07-18 经 Management API 执行（scripts/import/run-sql.mjs）

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS address text;
