import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminNav from "./AdminNav";
import { AdminAnalyticsProvider } from "./admin-analytics-context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <div
      className="admin-layout"
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AdminNav user={session.user} />
      <main style={{ flex: 1, height: "100%", overflowY: "auto", padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <AdminAnalyticsProvider>{children}</AdminAnalyticsProvider>
        </div>
      </main>

      <style>{`
        .admin-layout,
        .admin-layout *,
        .admin-layout *::before,
        .admin-layout *::after {
          border-radius: 0px !important;
        }
      `}</style>
    </div>
  );
}
