import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidSlot } from "@/lib/slots";

const PAGE_PRICE_BW = 5;
const PAGE_PRICE_COLOR = 10;

async function getAddonPrices(): Promise<Record<string, number>> {
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ["staple_cost", "punch_cost", "cobra_file_cost", "transparent_file_cost", "folder_cost"] } },
  });
  const map: Record<string, number> = {};
  for (const s of settings) {
    map[s.key] = parseFloat(s.value) || 0;
  }
  return {
    staple: map.staple_cost ?? 2,
    punchHoles: map.punch_cost ?? 1,
    cobraFile: map.cobra_file_cost ?? 20,
    transparentFile: map.transparent_file_cost ?? 10,
    folder: map.folder_cost ?? 15,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "admin") {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        pickupCode: true,
      },
    });
    return NextResponse.json(orders);
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { pickupCode: true },
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      fileName,
      filePath,
      fileSize,
      pages,
      copies,
      printMode,
      printSide,
      addons,
      notes,
      pickupDate,
      pickupSlot,
      paymentConfirmed,
    } = body;

    if (!fileName || !filePath || !pages || !copies || !printMode || !printSide) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (pickupSlot && !isValidSlot(pickupSlot)) {
      return NextResponse.json({ error: "Invalid pickup slot" }, { status: 400 });
    }

    const totalPagesNeeded = pages * copies;
    const pagePrice = printMode === "COLOR" ? PAGE_PRICE_COLOR : PAGE_PRICE_BW;

    const addonPrices = await getAddonPrices();
    let totalAddonCost = 0;
    if (addons) {
      for (const [key, enabled] of Object.entries(addons)) {
        if (enabled && addonPrices[key]) {
          totalAddonCost += addonPrices[key] * copies;
        }
      }
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "active" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    const hasSubscription = !!subscription;
    const remainingPages = subscription
      ? Math.max(0, subscription.pagesAllowed - subscription.pagesUsed)
      : 0;

    let coveredBySub = 0;
    let excessPages = 0;
    let chargeablePages = totalPagesNeeded;

    if (hasSubscription) {
      if (totalPagesNeeded <= remainingPages) {
        coveredBySub = totalPagesNeeded;
        chargeablePages = 0;
        excessPages = 0;
      } else {
        coveredBySub = remainingPages;
        excessPages = totalPagesNeeded - remainingPages;
        chargeablePages = excessPages;
      }
    }

    const pageCost = chargeablePages * pagePrice;
    const totalCost = pageCost + totalAddonCost;
    const requiresPayment = totalCost > 0;

    console.log("========== ORDER CALCULATION ==========");
    console.log("User ID:", session.user.id);
    console.log("File:", fileName);
    console.log("Pages:", pages, "× Copies:", copies, "= Total:", totalPagesNeeded);
    console.log("Print mode:", printMode, "| Page price:", pagePrice);
    console.log("Subscription status:", hasSubscription ? "ACTIVE" : "NONE");
    if (hasSubscription) {
      console.log("Plan:", subscription.plan.name);
      console.log("Pages allowed:", subscription.pagesAllowed);
      console.log("Pages used:", subscription.pagesUsed);
      console.log("Remaining pages:", remainingPages);
      console.log("Covered by subscription:", coveredBySub);
    }
    console.log("Excess pages:", excessPages);
    console.log("Chargeable pages:", chargeablePages);
    console.log("Page cost (rupees):", pageCost);
    console.log("Addon cost (rupees):", totalAddonCost);
    console.log("Total cost (rupees):", totalCost);
    console.log("Requires payment:", requiresPayment);
    console.log("Payment confirmed:", !!paymentConfirmed);
    console.log("========================================");

    if (requiresPayment && !paymentConfirmed) {
      return NextResponse.json({
        requiresPayment,
        amount: totalCost,
        pageCost,
        addonCost: totalAddonCost,
        chargeablePages,
        excessPages,
        coveredBySub,
        hasSubscription,
        remainingPages,
        totalPagesNeeded,
        message: "Payment required to complete order",
      });
    }

    if (hasSubscription && coveredBySub > 0) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { pagesUsed: subscription.pagesUsed + coveredBySub },
      });
      console.log("Deducted", coveredBySub, "pages from subscription");
    }

    const now = new Date();
    const orderNumber = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        fileName,
        filePath,
        fileSize,
        pages,
        copies,
        printMode,
        printSide,
        addons: addons || {},
        addonCost: totalAddonCost,
        notes,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        pickupSlot,
      },
    });

    console.log("Order created:", order.id, orderNumber);
    console.log("========================================");

    return NextResponse.json(
      {
        order,
        totalCost,
        chargeablePages,
        excessPages,
        coveredBySub,
        pageCost,
        addonCost: totalAddonCost,
        message: "Order submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: error.message || "Order creation failed" }, { status: 500 });
  }
}
