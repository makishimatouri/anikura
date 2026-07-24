import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/admin/context";

export default async function LegacyAdminPanelPage() {
  await requireAdminContext();
  redirect("/admin/events");
}
