// 通过 Supabase Management API 执行 SQL（DDL 通道）
// 用法：node scripts/import/run-sql.mjs <sql-file> 或 node scripts/import/run-sql.mjs -e "SQL"
// 依赖 .env.local 的 SUPABASE_ACCESS_TOKEN；token 不打印、不落盘
import { readFileSync } from "node:fs";
import { loadEnv } from "./db.mjs";

const env = loadEnv();
const token = env.SUPABASE_ACCESS_TOKEN;
if (!token) { console.error("✗ .env.local 缺少 SUPABASE_ACCESS_TOKEN"); process.exit(2); }

const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
let sql;
if (process.argv[2] === "-e") sql = process.argv[3];
else sql = readFileSync(process.argv[2], "utf8");

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`✗ ${res.status}: ${text.slice(0, 300)}`);
  process.exit(1);
}
console.log("✓ 执行成功:", text.slice(0, 200) || "(无返回)");
