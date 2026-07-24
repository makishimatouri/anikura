import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminContext } from "@/lib/admin/context";
import { canUseAdminCommand } from "@/lib/admin/policy";
import { getServerSupabase } from "@/lib/auth";

type Filter = "all" | "pending" | "approved" | "rejected";

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const context = await requireAdminContext();
  const supabase = await getServerSupabase();
  const requested = (await searchParams).status;
  const filter: Filter = ["pending", "approved", "rejected"].includes(requested ?? "") ? requested as Filter : "all";
  let query = supabase.from("events").select("id,title,date,city,venue,review_status,source,import_batch").order("date", { ascending: false });
  if (filter !== "all") query = query.eq("review_status", filter);
  const { data: events } = await query.limit(200);

  const filters: Array<{ value: Filter; label: string }> = [
    { value: "all", label: "全部" }, { value: "pending", label: "待审核" },
    { value: "approved", label: "已发布" }, { value: "rejected", label: "已驳回" },
  ];

  return (
    <AdminShell context={context} active="events" eyebrow="EVENT WORKSPACE" title="活动工作区" description={context.schemaReady ? "统一处理活动草稿、审核状态与兼容修订数据。删除和批量危险操作暂不开放。" : "统一查看旧字段与新修订层的兼容数据。数据库命令层尚未启用，当前保持只读。"}>
      <div className="flex flex-wrap items-center gap-2" aria-label="状态筛选">
        {filters.map((item) => (
          <Link key={item.value} href={item.value === "all" ? "/admin/events" : `/admin/events?status=${item.value}`} aria-current={filter === item.value ? "page" : undefined} className={`min-h-11 border px-4 py-3 text-xs ${filter === item.value ? "border-[#a855f7]/70 bg-[#a855f7]/10 text-white" : "border-white/10 text-[#8f8999] hover:text-white"}`}>
            {item.label}
          </Link>
        ))}
        {canUseAdminCommand(context.schemaReady, context.roles, "event:create") && <Link href="/admin/events/new" className="min-h-11 border border-[#a855f7]/70 bg-[#a855f7] px-4 py-3 text-xs text-white sm:ml-auto">创建活动草稿</Link>}
      </div>

      <div className="mt-5 overflow-hidden border border-white/10 bg-[#111017]">
        <div className="hidden grid-cols-[minmax(0,1.6fr)_120px_140px_120px] gap-4 border-b border-white/10 px-5 py-3 font-en text-[10px] tracking-[0.18em] text-[#716a7b] md:grid">
          <span>EVENT</span><span>DATE</span><span>LOCATION</span><span>STATE</span>
        </div>
        <div className="divide-y divide-white/10">
          {(events ?? []).map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`} className="grid min-h-20 gap-2 px-4 py-4 hover:bg-white/[0.025] md:grid-cols-[minmax(0,1.6fr)_120px_140px_120px] md:items-center md:gap-4 md:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm text-[#ece8f0]">{event.title}</p>
                <p className="mt-1 truncate text-[10px] tracking-[0.08em] text-[#716a7b]">{event.source === "bulk-import" ? "BULK IMPORT" : "MANUAL"}{event.import_batch ? ` · ${event.import_batch}` : ""}</p>
              </div>
              <span className="text-xs text-[#a9a2b1]">{event.date}</span>
              <span className="truncate text-xs text-[#a9a2b1]">{event.city} · {event.venue}</span>
              <EventState value={event.review_status} />
            </Link>
          ))}
          {(events ?? []).length === 0 && <p className="px-5 py-14 text-center text-sm text-[#716a7b]">当前筛选没有活动</p>}
        </div>
      </div>
    </AdminShell>
  );
}

function EventState({ value }: { value: string | null }) {
  const map = value === "approved" ? ["已发布", "text-[#8fd6ae]"] : value === "rejected" ? ["已驳回", "text-[#dc8c9b]"] : ["待审核", "text-[#cdb878]"];
  return <span className={`text-xs ${map[1]}`}>{map[0]}</span>;
}
