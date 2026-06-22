import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        where: { status: "active" },
        take: 1,
        include: { plan: true },
      },
      _count: { select: { orders: true } },
    },
  });

  return <AdminUsersClient users={users} />;
}
