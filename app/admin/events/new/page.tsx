import { requireAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import EventForm from "@/components/admin/EventForm";

export default async function NewEventPage() {
  const session = await requireAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">新增活动</h1>
      <EventForm isSuper={!!profile?.is_super_admin} />
    </div>
  );
}
