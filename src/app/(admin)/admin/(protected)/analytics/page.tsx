import { requireAdmin } from "@/lib/auth-guard";
import AnalyticsClient from "./AnalyticsClient";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  return <AnalyticsClient />;
}
