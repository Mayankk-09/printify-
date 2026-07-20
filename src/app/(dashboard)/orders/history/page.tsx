import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoryOrdersClient from "./HistoryOrdersClient";

export const dynamic = "force-dynamic";

export default async function HistoryOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin/dashboard");

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["COLLECTED", "CANCELLED"] },
    },
    orderBy: { createdAt: "desc" },
    include: { pickupCode: true },
  });

  return <HistoryOrdersClient orders={orders} />;
}
