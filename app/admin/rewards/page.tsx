import AdminShell from "@/components/admin/AdminShell";
import { requireAdminContext } from "@/lib/admin/context";
import { hasAdminCapability } from "@/lib/admin/policy";
import { redirect } from "next/navigation";

export default async function AdminRewardsPage() {
  const context = await requireAdminContext();
  if (!hasAdminCapability(context.roles, "event:operate") && !context.roles.includes("system_owner")) redirect("/admin/dashboard");
  return <AdminShell context={context} active="rewards" eyebrow="OPERATIONS DATA" title="运营资料" description="旧奖品后台在首个里程碑中保留为只读回退，不执行新增、兑换或库存修改。"><div className="border border-white/10 bg-[#111017] p-6"><p className="font-en text-xs tracking-[0.16em] text-[#a855f7]">LEGACY FALLBACK</p><h2 className="mt-3 text-xl">运营写入暂未迁移</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#8f8999]">活动工作区完成验收后，再按相同的服务端命令和审计模式迁移奖品管理。</p></div></AdminShell>;
}
