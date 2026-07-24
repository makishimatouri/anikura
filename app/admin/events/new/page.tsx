import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EventForm from "@/components/admin/EventForm";
import { requireAdminContext } from "@/lib/admin/context";
import { canUseAdminCommand } from "@/lib/admin/policy";

export default async function NewEventPage() {
  const context = await requireAdminContext();
  if (!canUseAdminCommand(context.schemaReady, context.roles, "event:create")) redirect("/admin/events");
  return <AdminShell context={context} active="events" eyebrow="CONTROLLED COMMAND" title="创建活动草稿" description="创建者由服务端会话确定；审核状态、发布状态、厂牌和精选标记不能由客户端指定。"><div className="max-w-3xl border border-white/10 bg-[#111017] p-4 sm:p-6"><EventForm /></div></AdminShell>;
}
