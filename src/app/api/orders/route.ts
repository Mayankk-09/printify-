import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PAGE_PRICE_BW, PAGE_PRICE_COLOR, calculateOrderCost } from "@/lib/pricing";
import { getPickupSettings, isValidSlot } from "@/lib/pickup";
import crypto from "crypto";

function generateOrderNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${date}-${rand}`;
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
        orderAddons: true,
        orderPack: true,
        payments: true,
      },
    });
    return NextResponse.json(orders);
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      pickupCode: true,
      orderAddons: true,
      orderPack: true,
      payments: true,
    },
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const {
      fileName,
      filePath,
      fileSize,
      pages,
      copies,
      printablePages,
      printMode,
      printSide,
      addonIds,
      notes,
      pickupDate,
      pickupSlot,
      paymentConfirmed,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    const numCopies = Number(copies) || 1;
    const totalPrintablePages = printablePages || pages * numCopies;

    if (!fileName || !filePath || !pages || !printMode || !printSide) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (pickupSlot) {
      const pickupSettings = await getPickupSettings();
      if (!isValidSlot(pickupSettings.slots, pickupSlot)) {
        return NextResponse.json({ error: "Invalid pickup slot" }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const settings = await prisma.systemSetting.findMany();
    const settingMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const trialMaxPages = parseInt(settingMap.trialMaxPages || "5", 10);

    const activeSubs = await prisma.subscription.findMany({
      where: { userId, status: "active" },
      include: { pack: true },
      orderBy: { createdAt: "asc" },
    });

    const totalAllowed = activeSubs.reduce((s, sub) => s + sub.pagesAllowed, 0);
    const totalUsed = activeSubs.reduce((s, sub) => s + sub.pagesUsed, 0);
    const remainingPages = Math.max(0, totalAllowed - totalUsed);

    const firstSub = activeSubs[0];
    const packType = firstSub?.pack?.packType || null;

    const addons = await prisma.addon.findMany({
      where: { id: { in: addonIds || [] }, active: true },
    });

    const addonPrices = addons.map((a) => ({
      price: a.price,
      quantity: numCopies,
    }));

    const isTrialEligible = user.hasClaimedTrial && !user.hasUsedTrial;

    const costResult = calculateOrderCost({
      pages,
      copies: numCopies,
      printMode,
      addonPrices,
      remainingPackPages: remainingPages,
      packType,
      isTrialEligible,
      trialMaxPages,
    });

    const { breakdown, chargeablePages, coveredByPack, isTrialUsed } = costResult;

    const requiresPayment = breakdown.grandTotal > 0 && !isTrialUsed;
    const pagePrice = printMode === "COLOR" ? PAGE_PRICE_COLOR : PAGE_PRICE_BW;

    if (isTrialEligible && !paymentConfirmed && printMode === "BW" && totalPrintablePages <= trialMaxPages && addonPrices.length === 0) {
      return NextResponse.json({
        requiresPayment: false,
        trialEligible: true,
        breakdown,
        chargeablePages,
        coveredByPack,
        message: "Trial eligible. Submit to use free trial.",
      });
    }

    if (requiresPayment && !paymentConfirmed) {
      return NextResponse.json({
        requiresPayment: true,
        amount: breakdown.grandTotal,
        breakdown,
        chargeablePages,
        coveredByPack,
        totalPrintablePages,
        pagePrice,
        message: "Payment required to complete order",
      });
    }

    if (!requiresPayment && remainingPages > 0 && coveredByPack > 0) {
      if (packType === "BW_ONLY" && printMode === "COLOR") {
        return NextResponse.json({
          requiresPayment: true,
          amount: breakdown.grandTotal,
          breakdown,
          chargeablePages,
          coveredByPack: 0,
          totalPrintablePages,
          pagePrice,
          message: "BW pack does not cover color printing. Payment required.",
        });
      }
    }

    if (remainingPages > 0 && coveredByPack > 0 && chargeablePages > 0 && !paymentConfirmed) {
      return NextResponse.json({
        requiresPayment: true,
        insufficientBalance: true,
        remainingPages,
        pagesRequired: chargeablePages,
        amount: breakdown.grandTotal,
        breakdown,
        chargeablePages,
        coveredByPack,
        message: "Insufficient page balance. Payment required for excess pages.",
      });
    }

    if (requiresPayment && paymentConfirmed && razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
      const bodyText = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(bodyText)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    if (coveredByPack > 0 && !isTrialUsed) {
      let toDeduct = coveredByPack;
      for (const sub of activeSubs) {
        if (toDeduct <= 0) break;
        const subRemaining = sub.pagesAllowed - sub.pagesUsed;
        const deductFromThis = Math.min(subRemaining, toDeduct);
        if (deductFromThis > 0) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { pagesUsed: sub.pagesUsed + deductFromThis },
          });
          toDeduct -= deductFromThis;
        }
      }
    }

    if (isTrialUsed) {
      await prisma.user.update({
        where: { id: userId },
        data: { hasUsedTrial: true, trialUsedAt: new Date() },
      });
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          fileName,
          filePath,
          fileSize,
          pages,
          copies: numCopies,
          printablePages: totalPrintablePages,
          printMode,
          printSide,
          notes,
          pickupDate: pickupDate ? new Date(pickupDate) : null,
          pickupSlot,
        },
      });

      if (addons.length > 0) {
        await tx.orderAddon.createMany({
          data: addons.map((a) => ({
            orderId: created.id,
            addonId: a.id,
            name: a.name,
            price: a.price,
            quantity: numCopies,
          })),
        });
      }

      if (firstSub) {
        await tx.orderPack.create({
          data: {
            orderId: created.id,
            packId: firstSub.packId,
            packName: firstSub.pack.name,
            packType: firstSub.pack.packType,
            pagesAllowed: firstSub.pagesAllowed,
            pagesUsed: coveredByPack,
            packPrice: firstSub.packPrice,
            subscriptionId: firstSub.id,
          },
        });
      }

      if (breakdown.grandTotal > 0 && (razorpayPaymentId || paymentConfirmed)) {
        await tx.payment.create({
          data: {
            userId,
            orderId: created.id,
            razorpayId: razorpayPaymentId || `manual-${orderNumber}`,
            razorpayOrderId: razorpayOrderId || orderNumber,
            amount: breakdown.grandTotal,
            currency: "INR",
            status: "COMPLETED",
            description: `Print order payment: ${orderNumber}`,
          },
        });
      }

      return created;
    });

    return NextResponse.json(
      {
        order,
        breakdown,
        chargeablePages,
        coveredByPack,
        isTrialUsed,
        message: isTrialUsed
          ? "Free trial order submitted successfully"
          : "Order submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: error.message || "Order creation failed" }, { status: 500 });
  }
}
