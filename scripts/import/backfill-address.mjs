// 回填 address：把 venue 里的「场地名+地址」拆成 venue=场地名、address=门牌地址
// 拆分依据：E1 AI 识读时的海报原文（reading.jsonl），逐条人工核对
// 用法：node scripts/import/backfill-address.mjs [--apply]（默认 dry-run）
// 保护：venue 已被手动改过的行默认跳过（keepVenue 标记的除外，只补地址）
import { adminClient } from "./db.mjs";

const APPLY = process.argv.includes("--apply");

// title -> [新 venue, 新 address]；venue 为 null 表示不改场地名只补地址
const SPLITS = {
  "次元电炒饭 二次元偶像宅舞专场": ["今站购物中心·天府红 动漫展区舞台", null],
  "玩坏了！次元电炒饭 游戏音乐主题活动": ["FLAT CLUB", "339购物中心A栋2层"],
  "前夜祭 ONLY1.0 西南莲之空": ["冉家坝扩列二次元", null],
  "ANIPULSE Vol.1 in NANJING": ["集庆舞蹈文化艺术工作室", "江苏省南京市秦淮区江苏通信大厦泽天大酒店6F"],
  "肉？フェス！in NANJING": ["观山河·江豚湾·户外烧烤团建拓展基地", null],
  "OTA LAB 壹周年特别活动 WITH FRIENDS": ["红仓·完美文创公园 偶联剧场", null],
  "第一届 ANIKURA（成都西博城）": ["西博城外场15-16号馆", null],
  "OTALAB Anisong DJ Fes": ["ANKR（具体场地名待补充）", null],
  "电气萌力（OTALAB × 存档点）": ["存档点SavePoint（科华北路店）", "科华北路"],
  "OTALAB 福州 Link Online Start": ["XG Dance 自助舞室", "福州市八一七路茶亭国际11楼1122室"],
  "OTALAB 阿宅跳舞实验室": ["半世界", "成都市青羊区富力中心6F"],
  "混沌极动": ["天府红购物中心7F", null],
  "於廢墟之上起舞 TEENAGE WASTELAND": ["金牛大悦城遗址", "西華大道C口"],
  "OTALAB Outdoors 动漫DJ跳舞打艺 野炊/无限饮酒": ["户外（具体位置见群，待补充）", null],
  "SONGWU 松屋 DANCE PARTY": ["嗨舞工作室（想飞天地店）", "松江区文汇路928弄32号想飞天地F2层"],
  "AniHotPot": ["音乐虫洞", "广州市珠江新城高德置地秋广场B1"],
  "连练会2 WOTAGEI DALIAN": ["HOLD DANCE STUDIO", null],
  "深セン舞踊部": ["HL舞蹈室", "深圳市福田区泰然科技园213栋4楼4B10（车公庙站F口或下沙站C口）"],
  "第一回 ANIKURA 甩手歌合戦": ["广州东站广场", null],
  "ANIKURA 机体 in WUHAN": ["Beach No.11 Park", null],
  "ANISON·宅音共鳴 ACG DJ PARTY": ["旧梦录Live沉浸式歌舞厅", "广东省广州市海珠区"],
  "FROZEN DANCE CLUB Vol.2 in CHANGCHUN": ["乐活LIVEHOUSE", "吉林省长春市朝阳区欧亚商都A座10F"],
  "ANIROX VOL.2 復活": ["LiveHUB", "上海市宝山区逸仙路1328号3号楼"],
  "蝦餃舞踏会 VOL.01 廣州 地下艺练习会": ["JS舞蹈（机构珠村店）", "广东省广州市天河区中山大道中1035号6楼"],
  "深セン舞踏喜歡部 VOL1.0": ["SKYDANCE舞蹈室", "深圳市福田区沙头街道福强路4001号深圳文化创业园A座四楼402（沙尾地铁B出口280米）"],
  "GAN FLUX 地下藝舞房 南昌": ["地下藝舞房（具体场地待补充）", null],
  "OTO BURST ANIKURA 電音派對": ["新视中LIVING剧场", "经十一路纬一路交叉路口"],
  "津門アニクラ舞踊会 海河電波": ["梦歌音乐现场", "天津市河东区津塘路154号河东金地广场"],
  "自由舞踊實驗室 LIBERUM": ["待补充（未来三三六小时音乐聚会）", null],
  "川练会 NEO-ASCENT 1/3": ["BOX DANCE STUDIO（青羊）", "新锦江時代锋尚"],
  "四川地下艺教学练习会 -2nd": ["BOX DANCE STUDIO（青羊店）", null],
  "Koya-LIVE 广州 THE IDOLM@STER ONLY（DAY2）": ["待补充", null],
  "氷菓 Session（氷菓舞踊部）": ["西安 LA 共享舞房", "雁塔区小寨路街道阳阳国际广场小六汤包隔壁 LA HOOD 负二层"],
  "昆练会 ANIKURA 1.0": ["洛桑芭蕾国际舞蹈艺术中心", "江苏省苏州市昆山市人民南路1188号昆城广场北一号楼17层1701室"],
  "ANISO-DRIVE vol.1 Ota-Ultimo": ["南山云舞艺术中心", "天津市西青区"],
  "福州第一届 LoveLive Only 前夜祭": ["DA Dance 自助舞蹈室", "台江区八一七中路与群众路交汇处 茶亭国际27层2707"],
  "成都偶像大师 ONLY 1st": ["MAO Livehouse", null],
  "音动VS音动次元 ANIKURA x 随机宅舞": ["DS创世岛2F", null],
  "琶洲外场 ANKR アニクラ vol.3": ["琶洲外场（户外，具体位置待补充）", null],
  "無錫茶屋祭 WUXI OTA TEASHOUSE ANIKURA 1ST": ["MEGA明珠", "无锡"],
  "琶洲外场 ANKR アニクラ vol.4": ["琶洲外场（户外，具体位置待补充）", null],
  "鷺榕余音 ACG.LIVE": ["卓越舞厅", "廈門市思明區明發商業廣場"],
  "次元电炒饭 Vocaloid专场 初音未来日巡2025放映会 & DJ TIME": ["Post party pub", "保利中心A座1403"],
  "Ani庄 Vol.4": [null, "上海市闵行区虹许路731号4号楼"], // 场地名东离已手动改好，只补地址
  "ARX FIRST DAWN 2025→2026": ["LiveHUB", "上海宝山区逸仙路1328号新业坊源创3号楼1楼"],
  "ヲ册那ANIKURA": ["舞十八舞房", "长宁区虹桥路1438号高岛屋百货4F"],
};

const sb = adminClient();
const { data: rows, error } = await sb.from("events").select("id, title, venue, address");
if (error) { console.error("✗ 查询失败:", error.message); process.exit(1); }

const plans = [], skips = [];
for (const e of rows) {
  const split = SPLITS[e.title];
  if (!split) continue;
  const [newVenue, newAddress] = split;
  if (newVenue === null) {
    // 只补地址（场地名已被人工改过）
    if (e.address) { skips.push({ title: e.title, reason: "address 已有值" }); continue; }
    plans.push({ id: e.id, title: e.title, address: newAddress });
  } else {
    if (e.address) { skips.push({ title: e.title, reason: "address 已有值" }); continue; }
    plans.push({ id: e.id, title: e.title, venue: newVenue, address: newAddress, oldVenue: e.venue });
  }
}

console.log(`${APPLY ? "[APPLY]" : "[DRY-RUN]"} 待更新 ${plans.length} 行，跳过 ${skips.length} 行`);
for (const p of plans) {
  if (p.venue) console.log(`- 「${p.title}」\n  场地: ${p.oldVenue}  =>  ${p.venue}\n  地址: ${p.address ?? "(空)"}`);
  else console.log(`- 「${p.title}」 只补地址: ${p.address}`);
}
for (const sk of skips) console.log(`~ 跳过 「${sk.title}」：${sk.reason}`);

if (APPLY) {
  let ok = 0, fail = 0;
  for (const p of plans) {
    const upd = { address: p.address };
    if (p.venue) upd.venue = p.venue;
    const { error: upErr } = await sb.from("events").update(upd).eq("id", p.id);
    if (upErr) { console.error(`✗ ${p.title}: ${upErr.message}`); fail++; } else ok++;
  }
  console.log(`结果：成功 ${ok}，失败 ${fail}`);
}
