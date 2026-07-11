export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error("SECURITY BLOCK: RAZORPAY_WEBHOOK_SECRET environment variable is missing!");
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  if (event.event !== "payment.captured") {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  const paymentEntity = event.payload?.payment?.entity;
  if (!paymentEntity) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  const metadata = paymentEntity.notes ?? {};
  const email = typeof metadata.email === "string" ? metadata.email.toLowerCase().trim() : "";
  const packId = typeof metadata.packId === "string" ? metadata.packId : "";

  if (!email || !packId) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  const razorpayPaymentId = paymentEntity.id as string;
  const razorpayOrderId = paymentEntity.order_id as string;
  const amountPaid = paymentEntity.amount as number;

  const existingPayment = await prisma.payment.findFirst({
    where: { razorpayId: razorpayPaymentId },
  });
  if (existingPayment) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  const pack = await prisma.pack.findUnique({ where: { id: packId } });
  if (!pack || !pack.active) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.create({
      data: {
        userId: user.id,
        packId: pack.id,
        packType: pack.packType,
        pagesAllowed: pack.pages,
        pagesUsed: 0,
        packPrice: pack.price,
        status: "active",
      },
    });

    const payment = await tx.payment.create({
      data: {
        userId: user.id,
        razorpayId: razorpayPaymentId,
        razorpayOrderId,
        amount: amountPaid,
        currency: "INR",
        status: "COMPLETED",
        description: `Webhook confirmed: ${pack.name}`,
      },
    });

    return { subscription, payment };
  });

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
