// E0：导出 events 全量快照到仓库外备份目录
import { adminClient } from "./db.mjs";
import { writeFileSync } from "node:fs";

const OUT = "/Users/edy/Documents/cnanikura网站/backups/20260718-bulk-import";
const sb = adminClient();

const { data: events, error } = await sb.from("events").select("*");
if (error) { console.error("导出失败:", error.message); process.exit(1); }
const payload = {
  exported_at: new Date().toISOString(),
  timezone_note: "导出时间为 UTC ISO；业务时区 Asia/Shanghai",
  table: "events",
  row_count: events.length,
  rows: events,
};
writeFileSync(`${OUT}/events-snapshot-20260718.json`, JSON.stringify(payload, null, 2));
console.log(`已导出 ${events.length} 行 -> ${OUT}/events-snapshot-20260718.json`);
