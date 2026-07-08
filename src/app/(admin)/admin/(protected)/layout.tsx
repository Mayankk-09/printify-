import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <AdminNav user={session.user} />
      <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 640px) {
          .admin-layout main { padding: 16px 14px 80px !important; }
        }
      `}</style>
    </div>
  );
}
