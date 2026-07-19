"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SectionHead from "@/components/home/SectionHead";
import Reveal from "@/components/ui/Reveal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError(
          "邮箱还没确认：请先到邮箱里点击确认链接（记得看垃圾箱）。链接过期的话，回到注册页用同一邮箱重新提交一次，会重新发确认邮件。"
        );
      } else {
        setError("登录失败：邮箱或密码错误");
      }
      return;
    }
    window.location.href = "/checkin";
  }

  return (
    <div className="max-w-sm mx-auto px-4 pt-14 pb-16 md:pt-20">
      <Reveal>
        <SectionHead en="LOGIN" cn="登 录" />
      </Reveal>
      <div className="mt-10">
        <Reveal>
          <p className="text-text-muted text-sm text-center mb-8">
            登录后每日签到赚积分，兑换活动优惠
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-text-muted block mb-1.5">邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="text-sm text-text-muted block mb-1.5">密码</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "登录中…" : "登录"}
            </button>
          </form>
          <p className="text-sm text-text-muted text-center mt-4">
            没有账号？{" "}
            <Link href="/auth/signup" className="text-neon-purple hover:underline">
              立即注册
            </Link>
          </p>
        </Reveal>
      </div>
    </div>
  );
}
