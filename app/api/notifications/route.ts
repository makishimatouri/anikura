import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid" }, { status: 401 });

  const { data, error } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data });
}

export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid" }, { status: 401 });

  const { action, notificationId } = await req.json();

  if (action === "mark_read") {
    await admin.from("notifications").update({ is_read: true }).eq("id", notificationId);
  } else if (action === "mark_all_read") {
    await admin.from("notifications").update({ is_read: true }).eq("user_id", userData.user.id).eq("is_read", false);
  }

  return NextResponse.json({ success: true });
}
