export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const [totalUsers, activeOrders, revenueAgg, pagesAgg, couponsUsed] =
      await Promise.all([
        prisma.user.count({ where: { role: "student" } }),
        prisma.order.count(),
        prisma.payment.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.order.aggregate({
          _sum: { printablePages: true },
        }),
        prisma.userCoupon.count(),
      ]);

    const totalRevenue = revenueAgg._sum.amount ?? 0;
    const totalPagesPrinted = pagesAgg._sum.printablePages ?? 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalUsers,
          activeOrders,
          totalRevenue,
          totalPagesPrinted,
          couponsUsed,
        },
        meta: {
          generatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Analytics aggregation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Analytics aggregation failed" },
      { status: 500 }
    );
  }
}
