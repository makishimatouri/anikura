import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoadingCover from "@/components/layout/LoadingCover";
import GrayGate from "@/components/layout/GrayGate";
import { getServerSupabase } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Anikura CN · 动漫歌曲活动聚合",
  description: "收录中国国内 Anikura、Vocaloid、东方 Project 等二次元音乐活动信息，由 AniROX 厂牌维护。",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 灰度门禁：仅当部署设置了 NEXT_PUBLIC_GRAY_HOST（灰度分支专属环境变量）时生效。
  // 生产构建未设置该变量，以下分支在构建期被裁剪，正式站渲染方式不受影响。
  const grayHost = process.env.NEXT_PUBLIC_GRAY_HOST;
  if (grayHost) {
    const h = await headers();
    const host = h.get("host") ?? "";
    // 灰度域名和本分支的 Vercel 预览域名统一上门禁：
    // 预览 SSO 已关闭（分支绑定的自定义域名不适用生产域名豁免），由本门禁兜底。
    if (host === grayHost || host.endsWith(".vercel.app")) {
      const pathname = h.get("x-pathname") ?? "";
      // 登录/注册/确认邮件回跳页面不放门禁，否则管理员无法登录
      if (!pathname.startsWith("/auth")) {
        const supabase = await getServerSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        let isAdmin = false;
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin, is_super_admin")
            .eq("id", session.user.id)
            .single();
          isAdmin = Boolean(profile?.is_admin || profile?.is_super_admin);
        }
        if (!isAdmin) {
          return (
            <html lang="zh-CN">
              <body>
                <GrayGate loggedIn={Boolean(session)} />
              </body>
            </html>
          );
        }
      }
    }
  }

  // 性能：首屏标题依赖 Anton，提前加载；Storage 图源提前建连（React 19 会把 link 提升到 head）
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : null;

  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <link
          rel="preload"
          href="/fonts/anton-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {supabaseOrigin && <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />}
        <LoadingCover />
        <Navbar />
        <main className="flex-1 pt-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
