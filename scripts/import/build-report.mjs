// 汇总 reading.jsonl → import-report.json + summary.md
// 应用合并关系、状态规则、归档目录规则（决策1）
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { loadEnv } from "./db.mjs";

const OUT = process.env.ANIKURA_BACKUP_DIR ?? join(homedir(), "Documents", "cnanikura网站", "backups", "20260718-bulk-import");
const TODAY = "2026-07-18"; // Asia/Shanghai 业务今日
const BATCH = "2026-07-folder-58";
const OWNER_ID = loadEnv().IMPORT_OWNER_ID; // 超管账号 id 存 .env.local，不进仓库
if (!OWNER_ID) { console.error("缺少 IMPORT_OWNER_ID（.env.local）"); process.exit(1); }

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

// Supabase Storage key 仅支持 ASCII（CJK 会 Invalid key），城市用拼音映射，活动名取 ASCII 部分，兜底 wall 编号
const CITY_PINYIN = {
  "成都": "chengdu", "南京": "nanjing", "上海": "shanghai", "广州": "guangzhou",
  "深圳": "shenzhen", "重庆": "chongqing", "武汉": "wuhan", "西安": "xian",
  "福州": "fuzhou", "天津": "tianjin", "大连": "dalian", "长春": "changchun",
  "南昌": "nanchang", "济南": "jinan", "厦门": "xiamen", "昆山": "kunshan",
  "无锡": "wuxi",
};
function slug(s) {
  return (s || "").replace(/[^A-Za-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
function archivePath(e) {
  let cityCn = null;
  if (e.city && e.city !== "其他") cityCn = e.city;
  else if (e.city === "其他" && e.city_note) {
    const m = e.city_note.match(/^([\u4e00-\u9fff]{2,3}?)（/);
    if (m) cityCn = m[1];
  }
  const cityPart = (cityCn && CITY_PINYIN[cityCn]) || "unknown";
  const slugPart = slug(e.title);
  const name = slugPart ? `${cityPart}-${e.file}-${slugPart}.jpg` : `${cityPart}-${e.file}.jpg`;
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
    // 同一活动的多版海报：全部归档上传，详情页展示 + 海报墙多版本上墙（决策补充 2026-07-18）
    extra_posters: (e.merged_from ?? []).map((m, i) => ({
      file: m.file,
      archive_path: archivePath(e).replace(/\.jpg$/, `-v${i + 2}.jpg`),
    })),
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
