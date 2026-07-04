import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id, status: "active" },
    include: { pack: true },
    orderBy: { createdAt: "asc" },
  });

  const totalAllowed = subscriptions.reduce((s, sub) => s + sub.pagesAllowed, 0);
  const totalUsed = subscriptions.reduce((s, sub) => s + sub.pagesUsed, 0);
  const remainingPages = Math.max(0, totalAllowed - totalUsed);

  return NextResponse.json({
    subscriptions,
    totalAllowed,
    totalUsed,
    remainingPages,
  });
}
