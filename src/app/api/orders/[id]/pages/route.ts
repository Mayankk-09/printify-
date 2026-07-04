import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { correctedPages } = await request.json();
    const newPages = parseInt(correctedPages, 10);
    if (isNaN(newPages) || newPages < 1) {
      return NextResponse.json({ error: "Invalid page count" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: id },
      include: { orderPack: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldPages = order.pages;
    const diff = newPages - oldPages;

    if (diff !== 0 && order.orderPack) {
      const sub = await prisma.subscription.findFirst({
        where: { userId: order.userId, status: "active" },
        orderBy: { createdAt: "asc" },
      });

      if (sub) {
        const newUsed = Math.max(0, sub.pagesUsed + diff);
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { pagesUsed: newUsed },
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id: id },
      data: { pages: newPages, printablePages: newPages * order.copies },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update pages" }, { status: 500 });
  }
}
