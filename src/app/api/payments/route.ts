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

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { packId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    if (!packId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    if (RAZORPAY_KEY_SECRET) {
      const bodyText = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(bodyText)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    const pack = await prisma.pack.findUnique({ where: { id: packId } });
    if (!pack || !pack.active) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
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

    const payment = await prisma.payment.create({
      data: {
        userId,
        razorpayId: razorpayPaymentId,
        razorpayOrderId,
        amount: pack.price,
        currency: "INR",
        status: "COMPLETED",
        description: `Page pack purchase: ${pack.name}`,
      },
    });

    return NextResponse.json({ payment, subscription }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 });
  }
}
