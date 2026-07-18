-- 活动多 QQ 群支持：群号数组（第一个为主群；旧 qq_group 列保留作兼容回退）
-- 后台只填群号，前台自动转换为加群跳转；旧 qq_group_name 列废弃不再写入
-- 执行方式：Supabase Dashboard SQL Editor（IF NOT EXISTS 可安全重复执行）

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS qq_groups text[];
