"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ConfirmedPage() {
  const [errorDesc, setErrorDesc] = useState("");
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Supabase 验证失败时会把错误放在 URL hash 里（#error=...&error_description=...）
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const desc = params.get("error_description");
    if (params.get("error") && desc) {
      setErrorDesc(desc.replace(/\+/g, " "));
    }
    setChecked(true);
  }, []);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendMsg("");
    setSending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirmed` },
    });
    setSending(false);
    if (error) {
      setResendMsg("发送失败，请稍后再试，或确认邮箱地址无误。");
      return;
    }
    setResendMsg("确认邮件已重新发送，请查收（记得看一下垃圾箱）。");
  }

  if (!checked) {
    return <div className="min-h-[70vh]" />;
  }

  if (errorDesc) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold">链接已失效</h1>
          <p className="text-text-muted">
            这个确认链接打不开或已过期（{errorDesc}）。确认链接只能使用一次，
            如果你之前已经点过，直接去登录就可以了。
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium"
          >
            去登录
          </Link>
          <div className="pt-6 border-t border-white/10 text-left">
            <p className="text-sm text-text-muted mb-3 text-center">
              还没确认过？输入注册邮箱，重新发一封确认邮件：
            </p>
            <form onSubmit={handleResend} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? "发送中…" : "重新发送确认邮件"}
              </button>
            </form>
            {resendMsg && (
              <p className="text-sm text-text-muted text-center mt-3">{resendMsg}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-bold">邮箱确认成功</h1>
        <p className="text-text-muted">
          你的账号已经激活，现在可以登录了。
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
