import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="container dashboard-content">
          {children}
        </div>
      </main>
      <style>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        .dashboard-main { flex: 1; margin-left: 240px; min-height: 100vh; }
        .dashboard-content { padding: 24px 28px 40px; max-width: 1180px; }
        @media (max-width: 1024px) { .dashboard-main { margin-left: 220px; } }
        @media (max-width: 768px) { .dashboard-main { margin-left: 0; padding-top: 0; } .dashboard-content { padding: 16px 14px 40px; } }
        @media (max-width: 375px) { .dashboard-content { padding: 12px 10px 32px; } }
        @media (max-width: 320px) { .dashboard-content { padding: 10px 8px 28px; } }
      `}</style>
    </div>
  );
}
