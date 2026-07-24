import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ReviewPublishButton from "@/components/admin/ReviewPublishButton";
import { requireAdminContext } from "@/lib/admin/context";
import { canUseAdminCommand } from "@/lib/admin/policy";
import { getServerSupabase } from "@/lib/auth";
import { EVENT_TAG_LABELS, type EventTag } from "@/lib/types";

export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requireAdminContext();
  const { id } = await params;
  const supabase = await getServerSupabase();
  const [{ data: event }, revisions] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("event_revisions").select("id,revision_number,state,created_at").eq("event_id", id).order("revision_number", { ascending: false }).limit(10),
  ]);
  if (!event) notFound();

  const tags = (event.tags ?? []) as EventTag[];
  return (
    <AdminShell context={context} active="events" eyebrow="EVENT RECORD" title="活动详情" description={context.schemaReady ? "核对活动公开字段、来源、审核状态与修订记录；具备权限的角色可执行受控审核发布。" : "只读核对活动公开字段、来源、审核状态与兼容修订记录。数据库命令层尚未启用。"}>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 border border-white/10 bg-[#111017]">
          <div className="border-b border-white/10 px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-en text-[10px] tracking-[0.18em] text-[#716a7b]">{event.id}</p>
                <h2 className="mt-2 break-words text-xl font-semibold text-white sm:text-2xl">{event.title}</h2>
              </div>
              <State value={event.review_status} />
            </div>
          </div>
          <dl className="grid sm:grid-cols-2">
            <Field label="日期" value={`${event.date}${event.start_time ? ` ${event.start_time.slice(0, 5)}` : ""}`} />
            <Field label="城市与场地" value={`${event.city} · ${event.venue}`} />
            <Field label="具体地址" value={event.address} />
            <Field label="主办方" value={event.organizer} />
            <Field label="票价" value={event.ticket_price} />
            <Field label="活动状态" value={event.status} />
            <Field label="来源" value={event.source === "bulk-import" ? "批量导入" : "手动创建"} />
            <Field label="导入批次" value={event.import_batch} />
          </dl>
          <div className="border-t border-white/10 px-4 py-5 sm:px-6">
            <p className="font-en text-[10px] tracking-[0.18em] text-[#716a7b]">TAGS</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.length ? tags.map((tag) => <span key={tag} className="border border-[#a855f7]/30 bg-[#a855f7]/8 px-2 py-1 text-xs text-[#c8b0e5]">{EVENT_TAG_LABELS[tag] ?? tag}</span>) : <span className="text-sm text-[#716a7b]">无标签</span>}
            </div>
          </div>
          <div className="border-t border-white/10 px-4 py-5 sm:px-6">
            <p className="font-en text-[10px] tracking-[0.18em] text-[#716a7b]">DESCRIPTION</p>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#aaa3b2]">{event.description || "暂无活动说明"}</p>
          </div>
        </section>

        <aside className="min-w-0 space-y-5">
          {event.review_status === "pending" && canUseAdminCommand(context.schemaReady, context.roles, "event:review_publish") && (
            <ReviewPublishButton eventId={event.id} eventTitle={event.title} />
          )}
          <section className="border border-white/10 bg-[#111017] p-4 sm:p-5">
            <p className="font-en text-[10px] tracking-[0.18em] text-[#716a7b]">POSTER</p>
            {event.poster_url ? (
              <a href={event.poster_url} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.poster_url} alt={event.title} className="h-auto w-full" />
              </a>
            ) : (
              <div className="mt-3 grid aspect-[3/4] place-items-center border border-dashed border-white/10 text-xs text-[#716a7b]">暂无海报</div>
            )}
          </section>
          <section className="border border-white/10 bg-[#111017] p-4 sm:p-5">
            <p className="font-en text-[10px] tracking-[0.18em] text-[#716a7b]">REVISION HISTORY</p>
            <div className="mt-3 space-y-2">
              {(revisions.data ?? []).map((revision) => <div key={revision.id} className="flex items-center justify-between border border-white/10 px-3 py-2 text-xs"><span>修订 {revision.revision_number}</span><span className="text-[#81798a]">{revision.state}</span></div>)}
              {(revisions.data ?? []).length === 0 && <p className="text-xs leading-5 text-[#716a7b]">暂无新修订记录，当前展示旧字段兼容数据。</p>}
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return <div className="min-w-0 border-b border-white/10 px-4 py-4 sm:border-r sm:px-6"><dt className="font-en text-[10px] tracking-[0.16em] text-[#716a7b]">{label}</dt><dd className="mt-2 break-words text-sm text-[#b9b2c1]">{value || "—"}</dd></div>;
}

function State({ value }: { value: string | null }) {
  const label = value === "approved" ? "已发布" : value === "rejected" ? "已驳回" : "待审核";
  return <span className="border border-[#a855f7]/35 bg-[#a855f7]/8 px-3 py-1.5 text-xs text-[#c8b0e5]">{label}</span>;
}
