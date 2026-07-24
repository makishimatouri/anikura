import { notFound } from "next/navigation";
import AdminShell, { AdminMetric } from "@/components/admin/AdminShell";
import ReviewPublishButton from "@/components/admin/ReviewPublishButton";

export default function AdminPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const context = {
    userId: "preview-user",
    email: null,
    roles: ["system_owner" as const],
    source: "membership" as const,
    schemaReady: true,
  };
  return (
    <AdminShell context={context} active="events" eyebrow="VISUAL ACCEPTANCE" title="活动工作区" description="本地视觉验收夹具，不读取数据库，不包含真实账号或联系人资料。">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminMetric label="EVENTS" value={86} note="活动总数" />
        <AdminMetric label="PENDING" value={12} note="待审核队列" />
        <AdminMetric label="USERS" value={128} note="注册用户" />
        <AdminMetric label="MODE" value="RO" note="只读工作区" />
      </section>
      <section className="mt-6 overflow-hidden border border-white/10 bg-[#111017]">
        {["上海动漫音乐活动", "广州 Vocaloid Party", "杭州东方主题专场"].map((title, index) => (
          <div key={title} className="grid min-h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/10 px-4 py-3 last:border-b-0 sm:px-5">
            <div className="min-w-0"><p className="truncate text-sm">{title}</p><p className="mt-1 text-xs text-[#716a7b]">2026-08-{String(index + 1).padStart(2, "0")} · 测试场地</p></div>
            <span className="border border-white/10 px-2 py-1 text-[10px] text-[#cdb878]">待审核</span>
          </div>
        ))}
      </section>
      <div className="mt-6 max-w-sm">
        <ReviewPublishButton eventId="preview-event" eventTitle="本地视觉验收活动" />
      </div>
    </AdminShell>
  );
}
