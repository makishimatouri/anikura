"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirmed`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-5xl">📮</div>
          <h1 className="text-2xl font-bold">确认邮件已发送</h1>
          <p className="text-text-muted">
            我们已向 <strong>{email}</strong> 发送了一封确认邮件。
            请点击邮件中的链接完成注册，然后回到这里登录。
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">注册</h1>
        <p className="text-text-muted text-sm text-center mb-8">
          注册后即可每日签到赚积分，兑换活动优惠券
        </p>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm text-text-muted block mb-1.5">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1.5">密码</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="至少 6 位"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "注册中…" : "注册"}
          </button>
        </form>
        <p className="text-sm text-text-muted text-center mt-4">
          已有账号？{" "}
          <Link href="/auth/login" className="text-neon-purple hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
