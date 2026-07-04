import { requireAdmin } from "@/lib/auth-guard";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  await requireAdmin();

  return <AdminOrdersClient />;
}
