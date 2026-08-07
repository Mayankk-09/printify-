// Analytics are computed LIVE from existing Prisma records.
//
// No snapshot tables, no cache tables, no cron jobs, no duplicated
// revenue/order storage. Every metric below is derived directly from the
// `Order`, `Payment` and `Subscription` tables via database aggregation
// (count / aggregate / sum / $queryRaw). Nothing is stored.
//
// Revenue split (Pack vs Pay Per Page):
//   - Pack purchases are created WITHOUT an `orderId` (see `api/payments`
//     and the Razorpay webhook), so `orderId IS NULL` identifies a PACK
//     purchase.
//   - Pay-per-page print payments ALWAYS reference their order (`orderId`
//     is set at creation in `api/orders`), so `orderId IS NOT NULL`
//     identifies a PAY_PER_PAGE payment.
//   This is structural (guaranteed by how payments are created), not
//   guessed from description strings, so no schema change / payment type
//   column is required.
//
// Completed orders use the terminal `COLLECTED` status (the existing
// "delivered" state in the OrderStatus enum).
//
// The "days" a record belongs to are computed in the application's local
// timezone. Chart buckets use `date_trunc` on a timezone-shifted copy of
// `createdAt` so the SQL grouping aligns exactly with the JS `where`
// boundaries used by the cards (no UTC/local drift).

import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import type { PrismaClient, Prisma } from "@prisma/client";

export type AnalyticsRange = "today" | "week" | "month";
export type ChartGranularity = "hour" | "day";

/** Assumed flat printing cost per printed page, in rupees. */
export const PRINTING_COST_PER_PAGE_RUPEES = 0.7;

/** Terminal "delivered/completed" status in the existing OrderStatus enum. */
export const COMPLETED_ORDER_STATUS = OrderStatus.COLLECTED;

/** DB handle required by the analytics queries (works with `prisma` or a transaction client). */
export type AnalyticsDbClient = PrismaClient | Prisma.TransactionClient;

export interface AnalyticsBucket {
  /** Wall-clock bucket key. Day: "YYYY-MM-DD", hour: "YYYY-MM-DDTHH". */
  key: string;
  value: number;
}

export interface AnalyticsData {
  range: AnalyticsRange;
  granularity: ChartGranularity;
  totalOrders: number;
  totalPagesPrinted: number;
  totalRevenuePaise: number;
  payPerPageRevenuePaise: number;
  packRevenuePaise: number;
  completedOrders: number;
  estimatedPrintingCostRupees: number;
  estimatedProfitRupees: number;
  revenueBuckets: AnalyticsBucket[];
  ordersBuckets: AnalyticsBucket[];
}

/** Start of the current day/week/month, in the application's local timezone. */
export function getRangeStart(range: AnalyticsRange, now: Date = new Date()): Date {
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return dayStart;
  if (range === "week") {
    // Week starts on Monday (Monday = 0 days back).
    const daysSinceMonday = (dayStart.getDay() + 6) % 7;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  }
  // Month starts on the 1st.
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function getGranularity(range: AnalyticsRange): ChartGranularity {
  return range === "today" ? "hour" : "day";
}

/** Minutes the application's local timezone is ahead of UTC (positive east of Greenwich). */
function getUtcOffsetMinutes(reference: Date): number {
  return -reference.getTimezoneOffset();
}

/** Hourly (today) / daily (week, month) revenue buckets from COMPLETED payments only. */
async function queryRevenueBuckets(
  client: AnalyticsDbClient,
  start: Date,
  granularity: ChartGranularity,
): Promise<AnalyticsBucket[]> {
  const trunc = granularity === "hour" ? "hour" : "day";
  const fmt = granularity === "hour" ? 'YYYY-MM-DD"T"HH24' : "YYYY-MM-DD";
  const offset = getUtcOffsetMinutes(start);

  const rows = await client.$queryRaw<Array<{ key: string; value: bigint }>>`
    SELECT to_char(
             date_trunc(${trunc}::text, ("createdAt" + (${offset}::int || ' minutes')::interval)),
             ${fmt}::text
           ) AS key,
           SUM("amount")::bigint AS value
    FROM "Payment"
    WHERE "status" = 'COMPLETED' AND "createdAt" >= ${start}
    GROUP BY 1
    ORDER BY 1
  `;

  return rows.map((r) => ({ key: r.key, value: Number(r.value) }));
}

/** Hourly (today) / daily (week, month) order-count buckets (all placed orders). */
async function queryOrdersBuckets(
  client: AnalyticsDbClient,
  start: Date,
  granularity: ChartGranularity,
): Promise<AnalyticsBucket[]> {
  const trunc = granularity === "hour" ? "hour" : "day";
  const fmt = granularity === "hour" ? 'YYYY-MM-DD"T"HH24' : "YYYY-MM-DD";
  const offset = getUtcOffsetMinutes(start);

  const rows = await client.$queryRaw<Array<{ key: string; value: bigint }>>`
    SELECT to_char(
             date_trunc(${trunc}::text, ("createdAt" + (${offset}::int || ' minutes')::interval)),
             ${fmt}::text
           ) AS key,
           COUNT(*)::bigint AS value
    FROM "Order"
    WHERE "createdAt" >= ${start}
    GROUP BY 1
    ORDER BY 1
  `;

  return rows.map((r) => ({ key: r.key, value: Number(r.value) }));
}

export async function getAnalytics(
  range: AnalyticsRange,
  client: AnalyticsDbClient = prisma,
): Promise<AnalyticsData> {
  const start = getRangeStart(range);
  const granularity = getGranularity(range);

  const [
    totalOrders,
    pagesPrinted,
    totalRevenue,
    payPerPageRevenue,
    packRevenue,
    completedOrders,
    revenueBuckets,
    ordersBuckets,
  ] = await Promise.all([
    // Total Orders: count of every placed print order (all statuses, including cancelled).
    client.order.count({ where: { createdAt: { gte: start } } }),
    // Total Pages Printed: pages x copies over placed (non-cancelled) orders.
    client.order.aggregate({
      where: { createdAt: { gte: start }, status: { not: OrderStatus.CANCELLED } },
      _sum: { printablePages: true },
    }),
    // Total Revenue Received: actual money received from users.
    client.payment.aggregate({
      where: { status: PaymentStatus.COMPLETED, createdAt: { gte: start } },
      _sum: { amount: true },
    }),
    // Pay Per Page Revenue: print-order payments always carry an orderId.
    client.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: { gte: start },
        orderId: { not: null },
      },
      _sum: { amount: true },
    }),
    // Pack Revenue: pack purchases never carry an orderId.
    client.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: { gte: start },
        orderId: null,
      },
      _sum: { amount: true },
    }),
    // Completed Orders: terminal COLLECTED (delivered) status only.
    client.order.count({
      where: { status: COMPLETED_ORDER_STATUS, createdAt: { gte: start } },
    }),
    queryRevenueBuckets(client, start, granularity),
    queryOrdersBuckets(client, start, granularity),
  ]);

  const totalPagesPrinted = pagesPrinted._sum.printablePages ?? 0;
  const totalRevenuePaise = totalRevenue._sum.amount ?? 0;

  return {
    range,
    granularity,
    totalOrders,
    totalPagesPrinted,
    totalRevenuePaise,
    payPerPageRevenuePaise: payPerPageRevenue._sum.amount ?? 0,
    packRevenuePaise: packRevenue._sum.amount ?? 0,
    completedOrders,
    // Estimated Printing Cost = Total Printed Pages x ₹0.70
    estimatedPrintingCostRupees: totalPagesPrinted * PRINTING_COST_PER_PAGE_RUPEES,
    // Estimated Profit = Revenue Received - Estimated Printing Cost
    estimatedProfitRupees: totalRevenuePaise / 100 - totalPagesPrinted * PRINTING_COST_PER_PAGE_RUPEES,
    revenueBuckets,
    ordersBuckets,
  };
}
