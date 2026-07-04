import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { OrderStatus, PrintMode } from "@prisma/client";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const printMode = searchParams.get("printMode");
    const pickupSlot = searchParams.get("pickupSlot");
    const pickupDateFrom = searchParams.get("pickupDateFrom");
    const pickupDateTo = searchParams.get("pickupDateTo");
    const orderDateFrom = searchParams.get("orderDateFrom");
    const orderDateTo = searchParams.get("orderDateTo");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, any> = {};

    if (status) {
      const statuses = status.split(",");
      where.status = { in: statuses };
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (printMode) {
      where.printMode = printMode as PrintMode;
    }

    if (pickupSlot) {
      where.pickupSlot = pickupSlot;
    }

    if (pickupDateFrom || pickupDateTo) {
      where.pickupDate = {};
      if (pickupDateFrom) where.pickupDate.gte = new Date(pickupDateFrom);
      if (pickupDateTo) where.pickupDate.lte = new Date(pickupDateTo);
    }

    if (orderDateFrom || orderDateTo) {
      where.createdAt = {};
      if (orderDateFrom) where.createdAt.gte = new Date(orderDateFrom);
      if (orderDateTo) where.createdAt.lte = new Date(orderDateTo);
    }

    const allowedSortFields = ["createdAt", "pickupDate", "submittedAt", "readyAt", "collectedAt", "printMode", "status"];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderByDir = sortOrder === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { [orderByField]: orderByDir },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          pickupCode: true,
          orderAddons: true,
          orderPack: true,
          payments: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    const statusCountsRaw = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusCounts = Object.fromEntries(
      statusCountsRaw.map((s) => [s.status, s._count])
    );

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
    });
  } catch (error: any) {
    console.error("Admin orders fetch failed:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}
