import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/auth";
import { getAdminContext } from "@/lib/admin/context";
import { canUseAdminCommand } from "@/lib/admin/policy";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!context.schemaReady) return NextResponse.json({ error: "Admin schema unavailable" }, { status: 503 });
  if (!canUseAdminCommand(context.schemaReady, context.roles, "event:review_publish")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const note = typeof body?.note === "string" ? body.note.slice(0, 1000) : null;
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc("admin_review_publish_event", {
    target_event_id: id,
    review_note_input: note,
  });

  if (error) return NextResponse.json({ error: "Review and publish failed" }, { status: 400 });
  return NextResponse.json({ eventId: data });
}
