import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin/dashboard");

  const userId = session.user.id;

  const [user, subscriptions, activeOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.subscription.findMany({
      where: { userId, status: "active" },
      include: { pack: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        userId,
        status: { in: ["SUBMITTED", "ACCEPTED", "PRINTING", "READY"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        pickupCode: true,
        orderAddons: true,
        orderPack: true,
      },
      take: 1,
    }),
  ]);

  if (!user) redirect("/login?reason=expired");

  const totalAllowed = subscriptions.reduce((s, sub) => s + sub.pagesAllowed, 0);
  const totalUsed = subscriptions.reduce((s, sub) => s + sub.pagesUsed, 0);
  const remainingPages = Math.max(0, totalAllowed - totalUsed);
  const hasTrial = user.hasClaimedTrial && !user.hasUsedTrial;
  const activeOrder = activeOrders[0] || null;

  return (
    <StudentDashboardClient
      user={user}
      subscriptions={subscriptions}
      totalAllowed={totalAllowed}
      totalUsed={totalUsed}
      remainingPages={remainingPages}
      activeOrder={activeOrder}
      hasTrial={hasTrial}
    />
  );
}
