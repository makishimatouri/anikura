"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/events", label: "活动" },
  { href: "/anirox", label: "AniROX" },
  { href: "/checkin", label: "签到" },
  { href: "/points", label: "积分" },
  { href: "/notifications", label: "通知" },
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAniroxPage = pathname === "/anirox";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session) {
        supabase
          .from("profiles")
          .select("is_admin, is_super_admin")
          .eq("id", data.session.user.id)
          .single()
          .then(({ data: p }) => {
            const profile = p as { is_admin: boolean; is_super_admin: boolean };
            setIsAdmin(!!profile && (profile.is_admin || profile.is_super_admin));
            setIsSuper(!!profile?.is_super_admin);
          });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session) {
        supabase
          .from("profiles")
          .select("is_admin, is_super_admin")
          .eq("id", session.user.id)
          .single()
          .then(({ data: p }) => {
            const profile = p as { is_admin: boolean; is_super_admin: boolean };
            setIsAdmin(!!profile && (profile.is_admin || profile.is_super_admin));
            setIsSuper(!!profile?.is_super_admin);
          });
      } else {
        setIsAdmin(false);
        setIsSuper(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-bg-elevated">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {isAniroxPage ? (
            <img src="/logo.png" alt="AniROX" className="h-7 w-auto brightness-0 invert" />
          ) : (
            <span className="text-xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
              Anikura CN
            </span>
          )}
        </Link>

        {/* 桌面端导航 */}
        <ul className="hidden md:flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-text-muted hover:text-text transition-colors px-2 py-2 rounded-md hover:bg-bg-elevated"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="ml-2 flex items-center gap-2">
            {isAdmin && (
              <Link href={isSuper ? "/admin/dashboard" : "/admin/panel"} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-neon-purple hover:to-neon-pink transition-colors font-medium">
                后台
              </Link>
            )}
            {user ? (
              <>
                <span className="text-xs text-text-muted hidden md:inline">{user.email}</span>
                <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-full border border-bg-elevated text-text-muted hover:text-text hover:border-neon-purple/50 transition-colors">
                  退出
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-xs px-3 py-1.5 rounded-full border border-bg-elevated text-text-muted hover:text-text hover:border-neon-purple/50 transition-colors">
                  登录
                </Link>
                <Link href="/auth/signup" className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white">
                  注册
                </Link>
              </>
            )}
          </li>
        </ul>

        {/* 手机端汉堡按钮 */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-text-muted"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* 手机端展开菜单 */}
      {menuOpen && (
        <div className="md:hidden bg-bg-card border-t border-bg-elevated px-4 py-3 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm ${
                pathname === link.href
                  ? "bg-neon-purple/20 text-neon-purple"
                  : "text-text-muted hover:bg-bg-elevated"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-bg-elevated flex flex-wrap gap-2">
            {isAdmin && (
              <Link href={isSuper ? "/admin/dashboard" : "/admin/panel"} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white">
                后台
              </Link>
            )}
            {user ? (
              <>
                <span className="text-xs text-text-muted w-full truncate">{user.email}</span>
                <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-full border border-bg-elevated text-text-muted">
                  退出
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-xs px-3 py-1.5 rounded-full border border-bg-elevated text-text-muted">登录</Link>
                <Link href="/auth/signup" className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white">注册</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
