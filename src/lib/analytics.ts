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
import { PrismaClient, Prisma } from "@prisma/client";

export type AnalyticsRange = "today" | "this_week" | "this_month" | "all_time";
export type ChartGranularity = "hour" | "day" | "month";

/** Assumed flat printing cost per printed page, in rupees. */
export const PRINTING_COST_PER_PAGE_RUPEES = 0.7;

/** Terminal "delivered/completed" status in the existing OrderStatus enum. */
export const COMPLETED_ORDER_STATUS = OrderStatus.COLLECTED;

/** DB handle required by the analytics queries (works with `prisma` or a transaction client). */
export type AnalyticsDbClient = PrismaClient | Prisma.TransactionClient;

export interface AnalyticsBucket {
  /** Wall-clock bucket key. Month: "YYYY-MM", day: "YYYY-MM-DD", hour: "YYYY-MM-DDTHH". */
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

/**
 * Start of the current day/week/month, in the application's local timezone.
 * `all_time` returns `null` so no `createdAt` bound is applied and the full
 * lifecycle history is queried.
 */
export function getRangeStart(range: AnalyticsRange, now: Date = new Date()): Date | null {
  if (range === "all_time") return null;
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return dayStart;
  if (range === "this_week") {
    // Week starts on Monday (Monday = 0 days back).
    const daysSinceMonday = (dayStart.getDay() + 6) % 7;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  }
  // Month starts on the 1st.
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function getGranularity(range: AnalyticsRange): ChartGranularity {
  if (range === "today") return "hour";
  if (range === "all_time") return "month";
  return "day";
}

/** The SELECT-expr parts shared by the bucket queries, derived from granularity. */
function bucketExpr(granularity: ChartGranularity): { trunc: string; fmt: string } {
  if (granularity === "hour") return { trunc: "hour", fmt: 'YYYY-MM-DD"T"HH24' };
  if (granularity === "month") return { trunc: "month", fmt: "YYYY-MM" };
  return { trunc: "day", fmt: "YYYY-MM-DD" };
}

/** Minutes the application's local timezone is ahead of UTC (positive east of Greenwich). */
function getUtcOffsetMinutes(reference: Date): number {
  return -reference.getTimezoneOffset();
}

/**
 * Revenue buckets from COMPLETED payments only. Grouped hourly (today),
 * daily (this week / this month) or monthly (all time). When `start` is null
 * the entire payment history is grouped.
 */
async function queryRevenueBuckets(
  client: AnalyticsDbClient,
  start: Date | null,
  granularity: ChartGranularity,
): Promise<AnalyticsBucket[]> {
  const { trunc, fmt } = bucketExpr(granularity);
  const offset = getUtcOffsetMinutes(start ?? new Date());

  const rows = await client.$queryRaw<Array<{ key: string; value: bigint }>>(start
    ? Prisma.sql`
        SELECT to_char(
                 date_trunc(${trunc}::text, ("createdAt" + (${offset}::int || ' minutes')::interval)),
                 ${fmt}::text
               ) AS key,
               SUM("amount")::bigint AS value
        FROM "Payment"
        WHERE "status" = 'COMPLETED' AND "createdAt" >= ${start}
        GROUP BY 1
        ORDER BY 1
      `
    : Prisma.sql`
        SELECT to_char(
                 date_trunc(${trunc}::text, ("createdAt" + (${offset}::int || ' minutes')::interval)),
                 ${fmt}::text
               ) AS key,
               SUM("amount")::bigint AS value
        FROM "Payment"
        WHERE "status" = 'COMPLETED'
        GROUP BY 1
        ORDER BY 1
      `);

  return rows.map((r) => ({ key: r.key, value: Number(r.value) }));
}

/**
 * Order-count buckets (all placed orders). Grouped hourly (today), daily
 * (this week / this month) or monthly (all time). When `start` is null the
 * entire order history is grouped.
 */
async function queryOrdersBuckets(
  client: AnalyticsDbClient,
  start: Date | null,
  granularity: ChartGranularity,
): Promise<AnalyticsBucket[]> {
  const { trunc, fmt } = bucketExpr(granularity);
  const offset = getUtcOffsetMinutes(start ?? new Date());

  const rows = await client.$queryRaw<Array<{ key: string; value: bigint }>>(start
    ? Prisma.sql`
        SELECT to_char(
                 date_trunc(${trunc}::text, ("createdAt" + (${offset}::int || ' minutes')::interval)),
                 ${fmt}::text
               ) AS key,
               COUNT(*)::bigint AS value
        FROM "Order"
        WHERE "createdAt" >= ${start}
        GROUP BY 1
        ORDER BY 1
      `
    : Prisma.sql`
        SELECT to_char(
                 date_trunc(${trunc}::text, ("createdAt" + (${offset}::int || ' minutes')::interval)),
                 ${fmt}::text
               ) AS key,
               COUNT(*)::bigint AS value
        FROM "Order"
        GROUP BY 1
        ORDER BY 1
      `);

  return rows.map((r) => ({ key: r.key, value: Number(r.value) }));
}

export async function getAnalytics(
  range: AnalyticsRange,
  client: AnalyticsDbClient = prisma,
): Promise<AnalyticsData> {
  const start = getRangeStart(range);
  const granularity = getGranularity(range);

  // `all_time` omits the `createdAt` bound so the full lifecycle history is queried.
  const rangeWhere = start ? { createdAt: { gte: start } } : {};

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
    client.order.count({ where: { ...rangeWhere } }),
    // Total Pages Printed: pages x copies over placed (non-cancelled) orders.
    client.order.aggregate({
      where: { ...rangeWhere, status: { not: OrderStatus.CANCELLED } },
      _sum: { printablePages: true },
    }),
    // Total Revenue Received: actual money received from users.
    client.payment.aggregate({
      where: { ...rangeWhere, status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    }),
    // Pay Per Page Revenue: print-order payments always carry an orderId.
    client.payment.aggregate({
      where: {
        ...rangeWhere,
        status: PaymentStatus.COMPLETED,
        orderId: { not: null },
      },
      _sum: { amount: true },
    }),
    // Pack Revenue: pack purchases never carry an orderId.
    client.payment.aggregate({
      where: {
        ...rangeWhere,
        status: PaymentStatus.COMPLETED,
        orderId: null,
      },
      _sum: { amount: true },
    }),
    // Completed Orders: terminal COLLECTED (delivered) status only.
    client.order.count({
      where: { ...rangeWhere, status: COMPLETED_ORDER_STATUS },
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
