// 回填 qq_groups：主群（qq_group 纯数字时）+ 从旧「群名称」里解析出的额外群号
// 用法：node scripts/import/backfill-qq-groups.mjs [--apply]（默认 dry-run）
// 依赖：events.qq_groups 列已存在（migration 20260718_event_qq_groups.sql）
import { adminClient } from "./db.mjs";

const APPLY = process.argv.includes("--apply");
const sb = adminClient();

let rows, error;
if (APPLY) {
  ({ data: rows, error } = await sb
    .from("events")
    .select("id, title, qq_group, qq_group_name")
    .is("qq_groups", null));
} else {
  // dry-run 不依赖新列，先预览计划
  ({ data: rows, error } = await sb.from("events").select("id, title, qq_group, qq_group_name"));
}
if (error) {
  if (error.message.includes("qq_groups")) {
    console.error("✗ qq_groups 列不存在：请先执行 supabase/migrations/20260718_event_qq_groups.sql");
    process.exit(2);
  }
  console.error("✗ 查询失败:", error.message); process.exit(1);
}

const plans = [];
for (const e of rows) {
  const groups = [];
  if (e.qq_group && /^\d{5,}$/.test(e.qq_group.trim())) groups.push(e.qq_group.trim());
  // 旧群名称里塞的额外群号（5 位以上数字）
  const extras = (e.qq_group_name ?? "").match(/\d{5,}/g) ?? [];
  for (const x of extras) if (!groups.includes(x)) groups.push(x);
  // 有内容才写；qq_group 是链接的行保持原样（前台按历史链接直跳）
  if (groups.length > 0 && (groups.length > 1 || !e.qq_group)) {
    plans.push({ id: e.id, title: e.title, qq_groups: groups });
  } else if (groups.length === 1 && e.qq_group) {
    plans.push({ id: e.id, title: e.title, qq_groups: groups });
  }
}

console.log(`${APPLY ? "[APPLY] " : "[DRY-RUN] "}待回填 ${plans.length} 行`);
for (const p of plans) console.log(`- 「${p.title}」-> [${p.qq_groups.join(", ")}]`);

if (APPLY) {
  let ok = 0, fail = 0;
  for (const p of plans) {
    const { error: upErr } = await sb.from("events").update({ qq_groups: p.qq_groups }).eq("id", p.id);
    if (upErr) { console.error(`✗ ${p.title}: ${upErr.message}`); fail++; } else ok++;
  }
  console.log(`结果：成功 ${ok}，失败 ${fail}`);
}
