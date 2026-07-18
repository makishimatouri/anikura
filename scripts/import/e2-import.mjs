// E2：归档上传 posters 桶 + 批量 insert（review_status=pending）
// 用法：node scripts/import/e2-import.mjs [--dry-run] [--force]
// 安全：默认先查批次是否已存在，存在即中止（--force 跳过）
import { adminClient } from "./db.mjs";
import { readFileSync } from "node:fs";

const OUT = "/Users/edy/Documents/cnanikura网站/backups/20260718-bulk-import";
const SRC = "/tmp/wall-optimized";
const DRY = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const report = JSON.parse(readFileSync(`${OUT}/import-report.json`, "utf8"));
const BATCH = report.batch;
const sb = adminClient();

// 防重复：批次已存在则中止
const { data: existing, error: exErr } = await sb.from("events").select("id").eq("import_batch", BATCH).limit(1);
if (exErr) {
  if (exErr.message.includes("import_batch")) {
    if (DRY) {
      console.warn("⚠ events 表还没有 import_batch 列（迁移未执行），dry-run 仅打印计划，不写库");
    } else {
      console.error("✗ events 表还没有 import_batch 列：请先在 Supabase SQL Editor 执行 supabase/migrations/20260718_event_import_review_columns.sql");
      process.exit(2);
    }
  } else {
    console.error("✗ 批次检查失败:", exErr.message); process.exit(1);
  }
}
if (!exErr && existing && existing.length > 0 && !FORCE) {
  console.error(`✗ 批次 ${BATCH} 已存在 ${existing.length} 条记录，中止。确认要重复导入加 --force`);
  process.exit(2);
}

console.log(`${DRY ? "[DRY-RUN] " : ""}批次 ${BATCH}，待导入 ${report.events.length} 条`);

let uploaded = 0, inserted = 0;
const failures = [];
for (const e of report.events) {
  const key = e.archive_path; // posters/YYYY-MM/... 或 posters/past/...
  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/posters/${encodeURI(key)}`;

  if (DRY) {
    console.log(`- ${e.file} -> ${key}\n  「${e.title}」${e.date} ${e.city} ${e.status} AX=${e.is_anirox}`);
    for (const x of e.extra_posters ?? []) console.log(`  + 多版本 ${x.file} -> ${x.archive_path}`);
    continue;
  }

  // 1. 上传主海报 + 额外海报（已存在则跳过上传复用 URL）
  const uploadOne = async (file, k) => {
    const buf = readFileSync(`${SRC}/${file}.jpg`);
    const { error } = await sb.storage.from("posters").upload(k, buf, {
      contentType: "image/jpeg",
      upsert: false,
    });
    return error && !error.message.includes("already exists") ? error.message : null;
  };
  const upErr = await uploadOne(e.file, key);
  if (upErr) {
    failures.push({ file: e.file, stage: "upload", error: upErr });
    console.error(`✗ 上传失败 ${e.file}: ${upErr}`);
    continue;
  }
  uploaded++;
  const extraUrls = [];
  for (const x of e.extra_posters ?? []) {
    const xErr = await uploadOne(x.file, x.archive_path);
    if (xErr) {
      failures.push({ file: x.file, stage: "upload-extra", error: xErr });
      console.error(`✗ 额外海报上传失败 ${x.file}: ${xErr}`);
      continue;
    }
    uploaded++;
    extraUrls.push(`${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/posters/${encodeURI(x.archive_path)}`);
  }

  // 2. 插入
  const row = {
    title: e.title, date: e.date, start_time: e.start_time, end_time: e.end_time,
    city: e.city, venue: e.venue, tags: e.tags, poster_url: publicUrl,
    poster_urls: extraUrls.length ? extraUrls : null,
    description: e.description, ticket_price: e.ticket_price, ticket_link: e.ticket_link,
    organizer: e.organizer, status: e.status, is_anirox: e.is_anirox,
    qq_group: e.qq_group, qq_group_name: e.qq_group_name,
    review_status: "pending", source: "bulk-import", import_batch: BATCH,
    created_by: report.owner_id,
  };
  const { error: insErr } = await sb.from("events").insert(row);
  if (insErr) {
    failures.push({ file: e.file, stage: "insert", error: insErr.message });
    console.error(`✗ 插入失败 ${e.file}: ${insErr.message}`);
    continue;
  }
  inserted++;
  console.log(`✓ ${e.file} 「${e.title}」`);
}

console.log(`\n结果：上传 ${uploaded}，插入 ${inserted}，失败 ${failures.length}`);
if (failures.length) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(`${OUT}/e2-failures.json`, JSON.stringify(failures, null, 2));
  console.log(`失败明细 -> ${OUT}/e2-failures.json`);
}
