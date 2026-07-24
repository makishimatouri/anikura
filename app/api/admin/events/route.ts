import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/auth";
import { getAdminContext } from "@/lib/admin/context";
import { hasAdminCapability, sanitizeEventCreateInput } from "@/lib/admin/policy";

export async function POST(request: Request) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasAdminCapability(context.roles, "event:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc(
    "admin_create_event_draft",
    { event_payload: sanitizeEventCreateInput(body as Record<string, unknown>) }
  );

  if (error) return NextResponse.json({ error: "Event creation failed" }, { status: 400 });
  return NextResponse.json({ eventId: data }, { status: 201 });
}
