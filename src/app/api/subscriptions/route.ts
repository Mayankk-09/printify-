import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { packId } = await request.json();
    if (!packId) {
      return NextResponse.json({ error: "Pack ID required" }, { status: 400 });
    }

    const pack = await prisma.pack.findUnique({ where: { id: packId } });
    if (!pack || !pack.active) {
      return NextResponse.json({ error: "Invalid or inactive pack" }, { status: 400 });
    }

    const existingSub = await prisma.subscription.findFirst({
      where: { packId, userId },
    });
    if (existingSub) {
      return NextResponse.json({ error: "You already have this pack" }, { status: 400 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        packId: pack.id,
        packType: pack.packType,
        pagesAllowed: pack.pages,
        pagesUsed: 0,
        packPrice: pack.price,
        status: "active",
      },
      include: { pack: true },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      pack: true,
    },
  });

  return NextResponse.json(subscriptions);
}
