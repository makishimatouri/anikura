import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // 检查 Supabase auth token cookie 是否存在
  const sbCookie = req.cookies.getAll().find(
    (c) => c.name.startsWith("sb-") && c.name.includes("auth-token")
  ) || req.cookies.get("sb-access-token");

  if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
    if (!sbCookie) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}
