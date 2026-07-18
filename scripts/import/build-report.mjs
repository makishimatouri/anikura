// 汇总 reading.jsonl → import-report.json + summary.md
// 应用合并关系、状态规则、归档目录规则（决策1）
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "/Users/edy/Documents/cnanikura网站/backups/20260718-bulk-import";
const TODAY = "2026-07-18"; // Asia/Shanghai 业务今日
const BATCH = "2026-07-folder-58";
const OWNER_ID = "d36758a5-8302-417c-a93b-06c56308e91c"; // 东离（超管）

const lines = readFileSync(`${OUT}/reading.jsonl`, "utf8").trim().split("\n").map(JSON.parse);
const byFile = Object.fromEntries(lines.map((l) => [l.file, l]));

const events = [];
const skipped = [];
for (const r of lines) {
  if (r.duplicate_of) { skipped.push({ file: r.file, reason: `重复文件，同 ${r.duplicate_of}`, note: r.dup_note }); continue; }
  if (r.skip_existing_db) { skipped.push({ file: r.file, reason: "库内已有活动（ヲ册那ANIKURA 2026-07-19）", note: r.dup_note }); continue; }
  if (r.merged_into) { skipped.push({ file: r.file, reason: `同一活动另一版海报，并入 ${r.merged_into}`, note: r.dup_note }); continue; }
  events.push(r);
}

// 把 merged 信息挂到主条目
for (const r of lines) {
  if (!r.merged_into) continue;
  const main = byFile[r.merged_into];
  (main.merged_from ??= []).push({ file: r.file, note: r.dup_note });
}

function slug(s, fallback) {
  // 保留中日韩文字与字母数字，其余折成 -；决策要求文件名带城市+活动名
  const clean = (s || "").replace(/[^\u4e00-\u9fff\u3040-\u30ffA-Za-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return clean || fallback;
}
function archivePath(e) {
  let cityPart = "城市待补充";
  if (e.city && e.city !== "其他") cityPart = e.city;
  else if (e.city === "其他" && e.city_note) {
    const m = e.city_note.match(/^(\u96c4\u9e6f|[\u4e00-\u9fff]{2,3}?)（/);
    if (m) cityPart = m[1];
  }
  const name = `${cityPart}-${slug(e.title, e.file)}.jpg`.replace(/[\/\\?%*:|"<>]/g, "-");
  if (e.date >= "2026-07-01") return `posters/${e.date.slice(0, 7)}/${name}`;
  return `posters/past/${name}`;
}

const report = {
  batch: BATCH,
  generated_at: new Date().toISOString(),
  timezone: "Asia/Shanghai",
  today: TODAY,
  source_files: 58,
  events_to_insert: events.length,
  skipped_files: skipped.length,
  owner_id: OWNER_ID,
  events: events.map((e) => ({
    file: e.file,
    title: e.title ?? "待补充",
    date: e.date ?? "2099-12-31",
    start_time: e.start_time ?? null,
    end_time: e.end_time ?? null,
    city: e.city ?? "待补充",
    venue: e.venue ?? "待补充",
    organizer: e.organizer ?? "待补充",
    is_anirox: !!e.is_anirox,
    tags: e.tags?.length ? e.tags : ["anikura"],
    ticket_price: e.ticket_price ?? "待补充",
    ticket_link: null,
    qq_group: e.qq_group ?? null,
    qq_group_name: e.qq_group_name ?? null,
    description: [e.desc, e.organizer_note ? `阵容/备注：${e.organizer_note}` : null, e.time_note ? `时间备注：${e.time_note}` : null, e.date_note ? `日期备注：${e.date_note}` : null, e.city_note ? `城市备注：${e.city_note}` : null, e.qq_note ? `群备注：${e.qq_note}` : null, e.ticket_link_note ? `购票备注：${e.ticket_link_note}` : null, e.dup_note && !e.dup_note.includes("均保留") ? `去重备注：${e.dup_note}` : null, ...(e.merged_from ?? []).map((m) => `另一版海报(${m.file})：${m.note}`)].filter(Boolean).join("\n") + (e.low_conf?.length ? `\n【低置信字段：${e.low_conf.join("、")}】` : "") + "\n【批量导入，待人工复核】",
    low_confidence: e.low_conf ?? [],
    status: (e.date ?? "2099-12-31") < TODAY ? "ended" : "ongoing",
    review_status: "pending",
    source: "bulk-import",
    import_batch: BATCH,
    created_by: OWNER_ID,
    archive_path: archivePath(e),
    series_note: e.dup_note?.includes("均保留") ? e.dup_note : null,
  })),
  skipped,
};

writeFileSync(`${OUT}/import-report.json`, JSON.stringify(report, null, 2));

// 人读摘要：每张一行
const cityStat = {};
for (const e of report.events) cityStat[e.city] = (cityStat[e.city] ?? 0) + 1;
let md = `# 批量导入识读摘要（58 张 → ${report.events.length} 条活动 + ${skipped.length} 张跳过）\n\n`;
md += `生成时间：${report.generated_at}（Asia/Shanghai）批次：${BATCH}\n\n`;
md += `## 待导入活动（${report.events.length} 条）\n\n`;
md += `| 文件 | 标题 | 日期 | 城市 | 场地 | 票价 | 状态 | 低置信 |\n|---|---|---|---|---|---|---|---|\n`;
for (const e of report.events) {
  md += `| ${e.file} | ${e.title}${e.is_anirox ? " ★AX" : ""} | ${e.date} | ${e.city} | ${e.venue.slice(0, 24)} | ${(e.ticket_price ?? "").slice(0, 14)} | ${e.status} | ${e.low_confidence.join(",") || "-"} |\n`;
}
md += `\n## 跳过文件（${skipped.length} 张）\n\n`;
for (const s of skipped) md += `- ${s.file}：${s.reason}${s.note ? `（${s.note.slice(0, 60)}）` : ""}\n`;
md += `\n## 城市分布\n\n`;
for (const [c, n] of Object.entries(cityStat).sort((a, b) => b[1] - a[1])) md += `- ${c}: ${n}\n`;
writeFileSync(`${OUT}/summary.md`, md);

console.log(`events: ${report.events.length}, skipped: ${skipped.length}`);
console.log(`ongoing: ${report.events.filter((e) => e.status === "ongoing").length}, ended: ${report.events.filter((e) => e.status === "ended").length}`);
console.log(`is_anirox: ${report.events.filter((e) => e.is_anirox).map((e) => e.file).join(",")}`);
console.log(`低置信行数: ${report.events.filter((e) => e.low_confidence.length > 0).length}`);
