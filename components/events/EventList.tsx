import { supabase } from "@/lib/supabase";
import { Event } from "@/lib/types";
import EventCard from "./EventCard";
import EventFilter from "./EventFilter";

interface EventListProps {
  city?: string | null;
  tag?: string | null;
  month?: string | null;
}

export default async function EventList({ city, tag, month }: EventListProps) {
  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "ongoing")
    .eq("review_status", "approved")
    .order("is_anirox", { ascending: false })
    .order("date", { ascending: true });

  if (city) query = query.eq("city", city);
  if (tag) query = query.contains("tags", [tag]);
  if (month) {
    const monthStart = `${month}-01`;
    // 取该月最后一天，避免 9/11 月用 31 号导致无效日期
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("date", monthStart).lte("date", monthEnd);
  }

  const { data: events, error } = await query;

  if (error) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>数据加载失败，请稍后重试</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="space-y-8">
        <EventFilter />
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg">该条件下暂无活动</p>
          <p className="mt-2 text-sm">试试其他筛选条件，或者去提交一个新活动</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EventFilter />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event: Event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
