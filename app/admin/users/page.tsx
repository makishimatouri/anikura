import AdminShell from "@/components/admin/AdminShell";
import { requireAdminContext } from "@/lib/admin/context";
import { hasAdminCapability } from "@/lib/admin/policy";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const context = await requireAdminContext();
  if (!hasAdminCapability(context.roles, "admin:manage")) redirect("/admin/dashboard");
  return <AdminShell context={context} active="users" eyebrow="ACCESS CONTROL" title="角色与范围" description="角色、业务范围和投稿联系人结构已经建立；本里程碑不分配真实生产管理员，也不写入真实联系人资料。"><ReadOnlyNotice title="尚未开放角色分配" text="当前仅展示权限架构入口。后续需在隔离环境验证授权审计和撤权流程后，再开放受控命令。" /></AdminShell>;
}

function ReadOnlyNotice({ title, text }: { title: string; text: string }) {
  return <div className="border border-white/10 bg-[#111017] p-6"><p className="font-en text-xs tracking-[0.16em] text-[#a855f7]">READ ONLY</p><h2 className="mt-3 text-xl">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#8f8999]">{text}</p></div>;
}
