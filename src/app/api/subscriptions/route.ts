import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) {
      return NextResponse.json({ error: "Invalid or inactive plan" }, { status: 400 });
    }

    const existingSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "active" },
      orderBy: { createdAt: "desc" },
    });

    const history = existingSub
      ? [
          ...(existingSub as any).history || [],
          {
            planId: existingSub.planId,
            pagesAllowed: existingSub.pagesAllowed,
            pagesUsed: existingSub.pagesUsed,
            endedAt: new Date().toISOString(),
          },
        ]
      : [];

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + plan.validityDays);

    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { status: "cancelled", cancelledAt: new Date() },
      });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        pagesAllowed: plan.pagesIncluded,
        pagesUsed: 0,
        startDate,
        expiryDate,
        status: "active",
      },
      include: { plan: true },
    });

    return NextResponse.json({ subscription, message: "Subscription activated" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Subscription failed" }, { status: 500 });
  }
}
