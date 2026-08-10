import { requireAdmin } from "@/lib/auth-guard";
import DashboardOverview from "./DashboardOverview";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  return <DashboardOverview userName={session.user!.name ?? "Admin"} />;
}
