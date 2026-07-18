import { notFound } from "next/navigation";
import { getServerSupabase, requireAdmin } from "@/lib/auth";
import EventForm from "@/components/admin/EventForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const session = await requireAdmin();
  const supabase = await getServerSupabase();
  const { id } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", session.user.id)
    .single();

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">编辑活动</h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-text-muted flex-wrap">
          {event.review_status && (
            <span>
              审核状态：{event.review_status === "pending" ? "待审核" : event.review_status === "approved" ? "已通过" : "已驳回"}
            </span>
          )}
          {event.import_batch && <span>导入批次：{event.import_batch}</span>}
          {event.source && <span>来源：{event.source === "bulk-import" ? "批量导入" : "手动创建"}</span>}
          {event.review_note && <span className="text-red-400/80">驳回备注：{event.review_note}</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-8 items-start">
        {event.poster_url ? (
          <div className="lg:sticky lg:top-20">
            <a href={event.poster_url} target="_blank" rel="noreferrer" className="block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.poster_url}
                alt={event.title}
                className="w-full rounded-lg border border-bg-elevated transition-opacity group-hover:opacity-90"
              />
              <p className="mt-2 text-xs text-text-muted text-center">点击放大查看原图</p>
            </a>
          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center h-40 rounded-lg border border-dashed border-bg-elevated text-sm text-text-muted">
            暂无海报
          </div>
        )}
        <div>
          <EventForm initialData={event} isSuper={!!profile?.is_super_admin} />
        </div>
      </div>
    </div>
  );
}
