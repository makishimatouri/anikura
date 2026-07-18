import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin";

/**
 * 非超管编辑「已通过」活动后调用：给所有超管写一条待复核通知。
 * 用 service role 读写，避免普通管理员受 RLS 限制查不到超管名单。
 */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid" }, { status: 401 });

  const { eventId, title } = await req.json();
  if (!eventId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data: supers } = await admin.from("profiles").select("id").eq("is_super_admin", true);
  const targets = (supers ?? []).filter((s) => s.id !== userData.user.id);
  if (targets.length === 0) return NextResponse.json({ success: true, notified: 0 });

  const { error } = await admin.from("notifications").insert(
    targets.map((s) => ({
      user_id: s.id,
      type: "event_review_needed",
      title: "活动修改待复核",
      message: `已通过的活动「${title}」被编辑，已回落至待审核并暂时下线，请复核`,
      reference_id: eventId,
    }))
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, notified: targets.length });
}
