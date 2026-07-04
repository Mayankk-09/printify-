import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const validStatuses: Record<string, string[]> = {
  SUBMITTED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PRINTING", "CANCELLED"],
  PRINTING: ["READY", "CANCELLED"],
  READY: ["COLLECTED"],
  COLLECTED: [],
  CANCELLED: [],
};

const statusTimestampField: Record<string, string> = {
  ACCEPTED: "acceptedAt",
  PRINTING: "printingAt",
  READY: "readyAt",
  COLLECTED: "collectedAt",
  CANCELLED: "cancelledAt",
};

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
    const { status } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id },
      include: { pickupCode: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const allowedNext = validStatuses[order.status];
    if (!allowedNext || !allowedNext.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = { status };
    const timestampField = statusTimestampField[status];
    if (timestampField) {
      updateData[timestampField] = new Date();
    }

    if (status === "READY") {
      const existingCode = await prisma.pickupCode.findUnique({
        where: { orderId: order.id },
      });
      if (!existingCode) {
        const code = `P-${order.orderNumber.slice(-4)}`;
        await prisma.pickupCode.create({
          data: {
            orderId: order.id,
            code,
          },
        });
      }
    }

    if (status === "COLLECTED") {
      await prisma.pickupCode.updateMany({
        where: { orderId: order.id },
        data: { collectedAt: new Date() },
      });
    }

    const updated = await prisma.order.update({
      where: { id: id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        pickupCode: true,
        orderAddons: true,
        orderPack: true,
        payments: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Status update failed" }, { status: 500 });
  }
}
