import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/admin/context";

export default async function AdminIndexPage() {
  await requireAdminContext();
  redirect("/admin/dashboard");
}
