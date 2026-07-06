import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

  // verify caller is super admin
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { data: profile } = await admin
    .from("profiles")
    .select("is_super_admin")
    .eq("id", userData.user.id)
    .single();
  if (!profile?.is_super_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, targetEmail, targetId } = await req.json();

  if (action === "set_admin") {
    const { error } = await admin
      .from("profiles")
      .update({ is_admin: true })
      .eq("email", targetEmail);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "set_admin_id") {
    const { error } = await admin
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "toggle_admin") {
    const { error } = await admin
      .from("profiles")
      .update({ is_admin: false })
      .eq("id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "set_super") {
    const { error } = await admin
      .from("profiles")
      .update({ is_super_admin: true })
      .eq("id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "unset_super") {
    const { error } = await admin
      .from("profiles")
      .update({ is_super_admin: false })
      .eq("id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
