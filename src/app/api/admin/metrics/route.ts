import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminMetrics } from "@/lib/admin-metrics";
import type { AnalyticsRange } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_PERIODS: AnalyticsRange[] = ["today", "this_week", "this_month", "all_time"];

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");
  const requestedPeriod: AnalyticsRange | null = VALID_PERIODS.includes(period as AnalyticsRange)
    ? (period as AnalyticsRange)
    : null;

  try {
    const payload = await getAdminMetrics();
    const data = requestedPeriod
      ? { ...payload, analytics: { [requestedPeriod]: payload.analytics[requestedPeriod] } }
      : payload;

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Admin metrics failed:", error);
    const message = error instanceof Error ? error.message : "Failed to load metrics";
    return Response.json({ error: message }, { status: 500 });
  }
}
