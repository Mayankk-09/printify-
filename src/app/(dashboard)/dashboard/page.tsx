import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin/dashboard");

  const userId = session.user.id;

  const [user, subscription, latestOrder] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.subscription.findFirst({
      where: { userId, status: "active" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findFirst({
      where: { userId, status: { in: ["SUBMITTED", "ACCEPTED", "PRINTING", "READY"] } },
      orderBy: { createdAt: "desc" },
      include: { pickupCode: true },
    }),
  ]);

  if (!user) redirect("/login");

  return <StudentDashboardClient user={user} subscription={subscription} activeOrder={latestOrder} />;
}
