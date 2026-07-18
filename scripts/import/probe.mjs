// 只读探测：events 现状、管理员账号、新列是否已存在、RPC DDL 能力、storage 桶
import { adminClient, SUPABASE_URL, loadEnv } from "./db.mjs";

const sb = adminClient();

// 1. events 全量（先看数量和标题，不 dump 全字段）
const { data: events, error: evErr } = await sb.from("events").select("id,title,date,city,venue,organizer,review_status,status,created_by,poster_url");
if (evErr) { console.error("events 查询失败:", evErr.message); process.exit(1); }
console.log("events 总数:", events.length);
for (const e of events) console.log(`- [${e.review_status}/${e.status}] ${e.date} ${e.city} ${e.title} | by=${e.created_by} | poster=${e.poster_url ? "有" : "无"}`);

// 2. 管理员账号（找东离 user id）
const { data: admins, error: adErr } = await sb.from("profiles").select("id,username,is_admin,is_super_admin").or("is_admin.eq.true,is_super_admin.eq.true");
if (adErr) console.error("profiles 查询失败:", adErr.message);
else { console.log("\n管理员:"); for (const a of admins) console.log(`- ${a.id} ${a.username ?? ""} super=${a.is_super_admin}`); }

// 3. 新列是否已存在（试着 select）
for (const col of ["import_batch", "source", "review_note"]) {
  const { error } = await sb.from("events").select(col).limit(1);
  console.log(`列 ${col}:`, error ? "不存在" : "已存在");
}

// 4. RPC DDL 能力探测（exec_sql 之类的函数一般不存在，确认即可）
const env = loadEnv();
const rpc = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: "POST",
  headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ sql: "select 1" }),
});
console.log("\nrpc exec_sql:", rpc.status, (await rpc.text()).slice(0, 120));

// 5. storage 桶列表 + posters 桶前缀
const { data: buckets, error: bErr } = await sb.storage.listBuckets();
if (bErr) console.error("buckets 查询失败:", bErr.message);
else console.log("\nbuckets:", buckets.map((b) => `${b.name}(public=${b.public})`).join(", "));

const { data: posterRoot, error: pErr } = await sb.storage.from("posters").list("", { limit: 100 });
if (pErr) console.error("posters 列目录失败:", pErr.message);
else console.log("posters 根目录:", posterRoot.map((f) => f.name).join(", ") || "(空)");
