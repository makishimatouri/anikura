import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function AdminIndexPage() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/admin/login");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, is_super_admin")
    .eq("id", session.user.id)
    .single();
  if (!profile?.is_admin && !profile?.is_super_admin) {
    redirect("/");
  }
  redirect("/admin/dashboard");
}
