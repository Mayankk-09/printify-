import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.freeTrialClaimed) {
      return NextResponse.json({ error: "Trial already claimed" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { freeTrialClaimed: true, freeTrialClaimedAt: new Date() },
    });

    return NextResponse.json({
      message: "Free trial claimed successfully!",
      freeTrialClaimed: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to claim trial" }, { status: 500 });
  }
}
