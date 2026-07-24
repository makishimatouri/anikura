import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminContext } from "@/lib/admin/context";
import { hasAdminCapability, type AdminRole } from "@/lib/admin/policy";

const ROLE_LABELS: Record<AdminRole, string> = {
  information_entry: "录入员",
  review_publisher: "审核发布员",
  operations_admin: "运营管理员",
  system_owner: "系统所有者",
};

interface Props {
  context: AdminContext;
  active: "dashboard" | "events" | "users" | "rewards";
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function AdminShell({ context, active, eyebrow, title, description, children }: Props) {
  const links = [
    { key: "dashboard", href: "/admin/dashboard", index: "01", label: "工作台", visible: true },
    { key: "events", href: "/admin/events", index: "02", label: "活动工作区", visible: true },
    {
      key: "rewards",
      href: "/admin/rewards",
      index: "03",
      label: "运营资料",
      visible: hasAdminCapability(context.roles, "event:operate") || context.roles.includes("system_owner"),
    },
    {
      key: "users",
      href: "/admin/users",
      index: "04",
      label: "角色与范围",
      visible: hasAdminCapability(context.roles, "admin:manage"),
    },
  ].filter((item) => item.visible);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#09090d] text-[#f4f2f8]">
      <div className="mx-auto grid w-full max-w-[1500px] gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#0d0c12] px-4 py-5 lg:min-h-[calc(100vh-3.5rem)] lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
          <div className="flex items-end justify-between gap-4 lg:block">
            <div>
              <p className="font-en text-[10px] tracking-[0.32em] text-[#a855f7]">ANIKURA CN</p>
              <p className="mt-1 font-display text-2xl leading-none tracking-wide">CONTROL</p>
            </div>
            <span className="border border-[#a855f7]/40 bg-[#a855f7]/10 px-2 py-1 font-en text-[10px] tracking-[0.16em] text-[#cda8ff]">
              READ ONLY
            </span>
          </div>

          <nav aria-label="后台主导航" className="mt-5 flex flex-wrap gap-2 lg:mt-10 lg:block lg:space-y-1">
            {links.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active === item.key ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 border px-3 py-2 font-en text-sm tracking-[0.08em] transition-colors motion-reduce:transition-none lg:w-full ${
                  active === item.key
                    ? "border-[#a855f7]/60 bg-[#a855f7]/12 text-white"
                    : "border-transparent text-[#8f8999] hover:border-white/10 hover:text-white"
                }`}
              >
                <span className="text-[10px] text-[#6f6878]">{item.index}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 border-t border-white/10 pt-4 lg:mt-12">
            <p className="text-[10px] tracking-[0.18em] text-[#716a7b]">当前权限</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {context.roles.map((role) => (
                <span key={role} className="border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-[#bdb7c6]">
                  {ROLE_LABELS[role]}
                </span>
              ))}
            </div>
            {context.source === "legacy" && (
              <p className="mt-2 text-[10px] leading-4 text-[#716a7b]">旧管理员字段只读兼容</p>
            )}
          </div>
        </aside>

        <main className="min-w-0 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
          <header className="border-b border-white/10 pb-6">
            <p className="font-en text-[11px] tracking-[0.24em] text-[#a855f7]">{eyebrow}</p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-none tracking-wide sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#918b9b]">{description}</p>
          </header>
          <div className="py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminMetric({ label, value, note }: { label: string; value: number | string; note: string }) {
  return (
    <div className="min-w-0 border border-white/10 bg-[#111017] p-4 sm:p-5">
      <p className="font-en text-[10px] tracking-[0.2em] text-[#81798a]">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none text-white sm:text-5xl">{value}</p>
      <p className="mt-3 text-xs text-[#716a7b]">{note}</p>
    </div>
  );
}
