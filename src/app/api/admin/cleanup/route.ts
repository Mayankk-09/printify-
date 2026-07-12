import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runDocumentCleanup, runUserCleanup } from "@/lib/cleanup";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "document";

    const start = Date.now();

    if (type === "user") {
      const result = await runUserCleanup();
      const elapsed = Date.now() - start;

      return NextResponse.json({
        type: "user",
        ...result,
        elapsed,
      });
    }

    const result = await runDocumentCleanup();
    const elapsed = Date.now() - start;

    return NextResponse.json({
      type: "document",
      ...result,
      elapsed,
    });
  } catch (error: any) {
    console.error("[Cleanup] Route error:", error.message);
    return NextResponse.json(
      { error: error.message || "Cleanup failed" },
      { status: 500 }
    );
  }
}
