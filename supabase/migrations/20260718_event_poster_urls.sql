-- 活动多海报支持：额外海报数组（主海报仍用 poster_url）
-- 背景：同一活动的多版海报在详情页全部展示、海报墙多版本上墙（东离 2026-07-18 补充决策）
-- 执行方式：Supabase Dashboard SQL Editor（IF NOT EXISTS 可安全重复执行）

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS poster_urls text[];
