import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnalytics, type AnalyticsRange } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const VALID_RANGES: AnalyticsRange[] = ["today", "week", "month"];

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("range") ?? "today";
  const range: AnalyticsRange = VALID_RANGES.includes(raw as AnalyticsRange)
    ? (raw as AnalyticsRange)
    : "today";

  try {
    const data = await getAnalytics(range);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin analytics failed:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
