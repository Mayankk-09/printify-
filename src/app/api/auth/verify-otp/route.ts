export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || typeof phone !== "string" || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    if (!pin || typeof pin !== "string" || !/^\d{4,8}$/.test(pin)) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    const authKey = process.env.MSG91_AUTH_KEY;
    if (!authKey) {
      return NextResponse.json({ error: "SMS service not configured" }, { status: 500 });
    }

    const formattedPhone = `91${phone}`;
    const verifyUrl = `https://control.msg91.com/api/v5/otp/verify?otp=${pin}&mobile=${formattedPhone}&authkey=${authKey}`;

    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || verifyData.type !== "success") {
      return NextResponse.json(
        { error: verifyData.message || "Invalid or expired OTP" },
        { status: 401 },
      );
    }

    let user = await prisma.user.findFirst({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `User-${phone.slice(-4)}`,
          email: `mobile-${phone}@printify.app`,
          phone,
          passwordHash: "",
          role: "student",
        },
      });
    }

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    if (!secret) {
      return NextResponse.json({ error: "Auth secret not configured" }, { status: 500 });
    }

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, role: user.role },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
