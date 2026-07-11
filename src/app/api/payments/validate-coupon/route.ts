export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponCode, baseAmount } = await request.json();

    if (!couponCode || typeof baseAmount !== "number" || baseAmount <= 0) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.hasOrderedBefore) {
      return NextResponse.json({ error: "Promotional coupons are strictly valid for first-time orders only." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "This promo code is currently disabled or expired." }, { status: 400 });
    }

    const alreadyUsed = await prisma.userCoupon.findUnique({
      where: { userId_couponId: { userId: user.id, couponId: coupon.id } },
    });

    if (alreadyUsed) {
      return NextResponse.json({ error: "You have already used this coupon." }, { status: 400 });
    }

    if (coupon.type === "PERCENTAGE") {
      const discount = baseAmount * (coupon.value / 100);
      const finalAmount = Math.max(0, baseAmount - discount);

      return NextResponse.json({
        valid: true,
        couponCode: coupon.code,
        type: coupon.type,
        discount,
        finalAmount,
      }, { status: 200 });
    }

    if (coupon.type === "FREE_PAGES") {
      return NextResponse.json({
        valid: true,
        couponCode: coupon.code,
        type: coupon.type,
        freePages: coupon.value,
        finalAmount: baseAmount,
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Unknown coupon type." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Coupon validation failed" },
      { status: 500 },
    );
  }
}
