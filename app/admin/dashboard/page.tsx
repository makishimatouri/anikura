import Link from "next/link";
import AdminShell, { AdminMetric } from "@/components/admin/AdminShell";
import { requireAdminContext } from "@/lib/admin/context";
import { getServerSupabase } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const context = await requireAdminContext();
  const supabase = await getServerSupabase();
  const [events, pending, users, recent] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id,title,date,city,review_status").order("created_at", { ascending: false }).limit(6),
  ]);

  return (
    <AdminShell
      context={context}
      active="dashboard"
      eyebrow="OPERATIONS OVERVIEW"
      title="工作台"
      description="第一实施里程碑只提供态势与只读入口。审核发布仍是原子动作，但本页暂不开放执行按钮。"
    >
      <section aria-label="关键数据" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminMetric label="EVENTS" value={events.count ?? 0} note="活动总数" />
        <AdminMetric label="PENDING" value={pending.count ?? 0} note="待审核队列" />
        <AdminMetric label="USERS" value={users.count ?? 0} note="注册用户" />
        <AdminMetric label="MODE" value="RO" note="只读工作区" />
      </section>

      <section className="mt-7 border border-white/10 bg-[#111017]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <h2 className="font-en text-sm tracking-[0.14em]">RECENT EVENTS</h2>
          <Link href="/admin/events" className="text-xs text-[#b98aff] hover:text-white">查看全部</Link>
        </div>
        <div className="divide-y divide-white/10">
          {(recent.data ?? []).map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`} className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 hover:bg-white/[0.025] sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm text-[#e9e5ee]">{event.title}</p>
                <p className="mt-1 text-xs text-[#716a7b]">{event.date} · {event.city}</p>
              </div>
              <Status value={event.review_status} />
            </Link>
          ))}
          {(recent.data ?? []).length === 0 && <p className="px-5 py-10 text-center text-sm text-[#716a7b]">暂无活动数据</p>}
        </div>
      </section>
    </AdminShell>
  );
}

function Status({ value }: { value: string | null }) {
  const label = value === "approved" ? "已发布" : value === "rejected" ? "已驳回" : "待审核";
  return <span className="whitespace-nowrap border border-white/10 px-2 py-1 text-[10px] text-[#a39baa]">{label}</span>;
}
