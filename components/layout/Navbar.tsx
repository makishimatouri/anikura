"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/", en: "HOME", cn: "首页" },
  { href: "/events", en: "EVENTS", cn: "全国活动" },
  { href: "/anirox", en: "AniROX", cn: "厂牌专场", brand: true },
  { href: "/checkin", en: "CHECK-IN", cn: "签到" },
  { href: "/points", en: "POINTS", cn: "积分" },
  { href: "/notifications", en: "NOTICE", cn: "通知" },
  { href: "/about", en: "ABOUT", cn: "关于" },
  { href: "/contact", en: "CONTACT", cn: "联系" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAniroxPage = pathname === "/anirox";

  useEffect(() => {
    function fetchProfile(userId: string) {
      supabase
        .from("profiles")
        .select("is_admin, is_super_admin")
        .eq("id", userId)
        .single()
        .then(({ data: p }) => {
          const profile = p as { is_admin: boolean; is_super_admin: boolean } | null;
          setIsAdmin(!!profile && (profile.is_admin || profile.is_super_admin));
          setIsSuper(!!profile?.is_super_admin);
        });
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session) fetchProfile(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsAdmin(false);
        setIsSuper(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 路由变化时自动收起抽屉
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // 抽屉打开时锁定页面滚动，Esc 关闭
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      {/* 极简顶栏：logo + 汉堡，全站深色底白字即清晰可见 */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5 md:px-8">
        <Link href="/" className="flex items-center" aria-label="Anikura CN 首页">
          {isAniroxPage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo.png" alt="AniROX" className="h-7 w-auto brightness-0 invert" />
          ) : (
            <span className="font-display text-xl tracking-wider text-white">
              Anikura&nbsp;CN
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          className="relative h-[22px] w-[34px] cursor-pointer"
        >
          <span
            className={`absolute left-0 h-[2px] w-full bg-white transition-all duration-300 ${
              menuOpen ? "top-[10px] rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-[10px] h-[2px] w-full bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 h-[2px] w-full bg-white transition-all duration-300 ${
              menuOpen ? "top-[10px] -rotate-45" : "top-[20px]"
            }`}
          />
        </button>
      </header>

      {/* 遮罩（移动端点空白处收抽屉） */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:bg-transparent"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 右侧抽屉菜单（TIS 风：EN 大字 + 中文小字 + 细线） */}
      <nav
        aria-hidden={!menuOpen}
        className={`fixed right-0 top-0 bottom-0 z-40 flex w-[min(420px,88vw)] flex-col border-l border-white/10 bg-[#0b0b11] px-8 pb-10 pt-24 transition-transform duration-[450ms] ease-[cubic-bezier(.7,0,.2,1)] md:px-12 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <p className="mb-7 text-[11px] tracking-[0.4em] text-text-muted">CONTENTS MENU</p>
        <div className="overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-baseline justify-between border-b border-white/10 py-[15px]"
            >
              <span
                className={`font-display text-3xl tracking-wide transition-all duration-300 group-hover:translate-x-1.5 ${
                  link.brand
                    ? "bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent"
                    : isActive(link.href)
                      ? "text-neon-purple"
                      : "text-text group-hover:text-neon-purple"
                }`}
              >
                {link.en}
              </span>
              <span className="text-xs text-text-muted">{link.cn}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link
              href={isSuper ? "/admin/dashboard" : "/admin/panel"}
              className="group flex items-baseline justify-between border-b border-white/10 py-[15px]"
            >
              <span className="font-display text-3xl tracking-wide text-text-muted transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-neon-purple">
                ADMIN
              </span>
              <span className="text-xs text-text-muted">后台</span>
            </Link>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-8">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-xs text-text-muted">{user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-full border border-white/15 px-5 py-2 text-[13px] text-text transition-colors hover:border-neon-purple/60"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="rounded-full border border-white/15 px-6 py-2 text-[13px] text-text transition-colors hover:border-neon-purple/60"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-gradient-to-r from-neon-purple to-neon-pink px-6 py-2 text-[13px] text-white transition-opacity hover:opacity-90"
              >
                注册
              </Link>
            </div>
          )}
          <p className="text-[11px] tracking-[0.12em] text-text-muted">
            MAINTAINED BY ANIROX
          </p>
        </div>
      </nav>
    </>
  );
}
