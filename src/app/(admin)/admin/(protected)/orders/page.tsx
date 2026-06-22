import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      pickupCode: true,
    },
  });

  return <AdminOrdersClient orders={orders} />;
}
