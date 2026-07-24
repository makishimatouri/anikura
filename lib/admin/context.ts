import "server-only";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/auth";
import { legacyRoles, type AdminRole } from "@/lib/admin/policy";

export interface AdminContext {
  userId: string;
  email: string | null;
  roles: AdminRole[];
  source: "membership" | "legacy";
  schemaReady: boolean;
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await getServerSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const [membershipResult, rolesResult, { data: profile }] = await Promise.all([
    supabase.from("admin_memberships").select("active").eq("user_id", user.id).maybeSingle(),
    supabase.from("admin_membership_roles").select("role").eq("user_id", user.id),
    supabase.from("profiles").select("is_admin, is_super_admin").eq("id", user.id).maybeSingle(),
  ]);
  const { data: membership } = membershipResult;
  const roleRows = rolesResult.data;
  const schemaReady = !membershipResult.error && !rolesResult.error;

  const membershipRoles = (roleRows ?? [])
    .map((row) => row.role)
    .filter((role): role is AdminRole =>
      ["information_entry", "review_publisher", "operations_admin", "system_owner"].includes(role)
    );

  if (membership?.active && membershipRoles.length > 0) {
    return { userId: user.id, email: user.email ?? null, roles: membershipRoles, source: "membership", schemaReady };
  }

  const roles = legacyRoles(Boolean(profile?.is_admin), Boolean(profile?.is_super_admin));
  return roles.length
    ? { userId: user.id, email: user.email ?? null, roles, source: "legacy", schemaReady }
    : null;
}

export async function requireAdminContext() {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  return context;
}
