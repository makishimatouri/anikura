import { supabase } from "@/lib/supabase";
import { Event } from "@/lib/types";
import EventBrowser from "./EventBrowser";
import { FilterOption } from "./FilterDropdown";

interface EventListProps {
  city?: string | null;
  tag?: string | null;
  month?: string | null;
  q?: string | null;
}

/** 月份选项：当月起的连续 6 个月 + 「过往活动」归档（月份基准按业务时区 Asia/Shanghai） */
function buildMonthOptions(): FilterOption[] {
  const nowYM = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
  });
  let [y, m] = nowYM.split("-").map(Number);
  const options: FilterOption[] = [{ value: "all", label: "全部" }];
  for (let i = 0; i < 6; i++) {
    const ym = `${y}-${String(m).padStart(2, "0")}`;
    options.push({ value: ym, label: `${y}年${m}月` });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  options.push({ value: "past", label: "过往活动" });
  return options;
}

/** 搜索词消毒：去掉 PostgREST or() 语法和 ilike 通配特殊字符 */
function sanitizeQuery(q: string): string {
  return q.replace(/[%_,().\\]/g, "").trim().slice(0, 50);
}

export default async function EventList({ city, tag, month, q }: EventListProps) {
  const isPast = month === "past";
  let query = supabase
    .from("events")
    .select("*")
    .eq("review_status", "approved");
  if (isPast) {
    // 过往活动归档视图：已结束、按日期倒序；城市/类型筛选照常生效
    query = query.eq("status", "ended").order("date", { ascending: false });
  } else {
    query = query
      .eq("status", "ongoing")
      .order("is_anirox", { ascending: false })
      .order("date", { ascending: true });
  }

  if (city) query = query.eq("city", city);
  if (tag) query = query.contains("tags", [tag]);
  if (month && !isPast) {
    const monthStart = `${month}-01`;
    // 取该月最后一天，避免 9/11 月用 31 号导致无效日期
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("date", monthStart).lte("date", monthEnd);
  }
  const keyword = q ? sanitizeQuery(q) : "";
  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,venue.ilike.%${keyword}%,organizer.ilike.%${keyword}%`
    );
  }

  const { data: events, error } = await query;

  if (error) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>数据加载失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <EventBrowser
      events={(events ?? []) as Event[]}
      current={{ city, tag, month, q }}
      monthOptions={buildMonthOptions()}
      isPastView={isPast}
    />
  );
}
