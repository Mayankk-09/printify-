import { prisma } from "@/lib/prisma";
import { getAnalytics, type AnalyticsData, type AnalyticsRange } from "@/lib/analytics";
import { PaymentStatus } from "@prisma/client";

export interface AdminOverviewMetrics {
  activePagePacks: number;
  totalRevenue: number;
  totalStudents: number;
  ordersToday: number;
  ordersThisMonth: number;
  totalOrders: number;
}

export interface AdminMetricsPayload {
  overview: AdminOverviewMetrics;
  analytics: Record<AnalyticsRange, AnalyticsData>;
  generatedAt: string;
}

const RANGES: AnalyticsRange[] = ["today", "this_week", "this_month", "all_time"];

export async function getAdminMetrics(): Promise<AdminMetricsPayload> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalStudents, totalOrders, revenueAgg, activePagePacks, ordersToday, ordersThisMonth, ...rangeResults] =
    await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.order.count(),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({
        where: {
          createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
        },
      }),
      ...RANGES.map((range) => getAnalytics(range)),
    ]);

  const analytics = Object.fromEntries(
    RANGES.map((range, i) => [range, rangeResults[i]]),
  ) as Record<AnalyticsRange, AnalyticsData>;

  return {
    overview: {
      activePagePacks,
      totalRevenue: revenueAgg._sum.amount ?? 0,
      totalStudents,
      ordersToday,
      ordersThisMonth,
      totalOrders,
    },
    analytics,
    generatedAt: new Date().toISOString(),
  };
}
