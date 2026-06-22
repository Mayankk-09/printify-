import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const validStatuses = ["SUBMITTED", "ACCEPTED", "PRINTING", "READY", "COLLECTED", "CANCELLED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: any = { status };

    if (status === "ACCEPTED") updateData.acceptedAt = new Date();
    if (status === "PRINTING") updateData.printingAt = new Date();
    if (status === "READY") updateData.readyAt = new Date();
    if (status === "COLLECTED") updateData.collectedAt = new Date();
    if (status === "CANCELLED") updateData.cancelledAt = new Date();

    if (status === "READY") {
      const order = await prisma.order.findUnique({ where: { id: id } });
      const code = `P-${order?.orderNumber?.slice(-4) || Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      await prisma.pickupCode.upsert({
        where: { orderId: id },
        update: { code },
        create: { orderId: id, code },
      });
    }

    const order = await prisma.order.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({ message: `Order status updated to ${status}`, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
