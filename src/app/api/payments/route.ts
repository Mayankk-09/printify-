import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { planId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    if (!planId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const bodyText = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        razorpayId: razorpayPaymentId,
        razorpayOrderId,
        amount: plan.monthlyPrice,
        currency: "INR",
        status: "COMPLETED",
        description: `Plan purchase: ${plan.name}`,
      },
    });

    const existingSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "active" },
      orderBy: { createdAt: "desc" },
    });

    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { status: "cancelled", cancelledAt: new Date() },
      });
    }

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + plan.validityDays);

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

    await prisma.payment.update({
      where: { id: payment.id },
      data: { subscriptionId: subscription.id },
    });

    return NextResponse.json({ payment, subscription }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 });
  }
}
