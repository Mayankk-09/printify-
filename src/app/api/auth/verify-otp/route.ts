export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

function getSecret(): Uint8Array {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SECURITY BLOCK: SESSION_SECRET environment variable is missing!");
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const transport = (await import("nodemailer")).createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const existingUser = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (existingUser) {
      await prisma.user.update({
        where: { email: sanitizedEmail },
        data: { otpCode: otp, otpExpires, otpName: null },
      });
    } else {
      await prisma.user.create({
        data: {
          email: sanitizedEmail,
          name: name?.trim() || "Campus Student",
          role: "student",
          passwordHash: "otp-auth",
          otpCode: otp,
          otpExpires,
          otpName: name?.trim() || null,
        },
      });
    }

    await transport.sendMail({
      from: `"Printify Gateway" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "[PRINTIFY] Your Access Security Pin",
      html: `<div style="font-family: monospace; padding: 20px; background: #F9F9F6; border: 1px solid #000;"><h2 style="margin-top: 0;">PRINTIFY IDENTITY GATEWAY</h2><p>Your confidential 6-digit access security token is: <strong style="font-size: 20px; letter-spacing: 2px;">${otp}</strong></p><p style="color: #666666; font-size: 11px;">This verification key is strictly confidential and expires inside 5 minutes.</p></div>`,
    });

    return NextResponse.json({ message: "Code sent" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to send verification code" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { email, otp, name } = await request.json();

    const sanitizedEmail = email ? email.toLowerCase().trim() : "";
    const sanitizedOtp = otp ? otp.toString().replace(/\s/g, "").trim() : "";
    const sanitizedName = name ? name.trim() : "";

    if (!sanitizedEmail || !sanitizedOtp) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user || !user.otpCode || !user.otpExpires) {
      return NextResponse.json({ error: "Invalid or expired security code" }, { status: 401 });
    }

    if (Date.now() > user.otpExpires.getTime()) {
      await prisma.user.update({
        where: { email: sanitizedEmail },
        data: { otpCode: null, otpExpires: null, otpName: null },
      });
      return NextResponse.json({ error: "Invalid or expired security code" }, { status: 401 });
    }

    if (user.otpCode !== sanitizedOtp) {
      return NextResponse.json({ error: "Invalid or expired security code" }, { status: 401 });
    }

    await prisma.user.update({
      where: { email: sanitizedEmail },
      data: { otpCode: null, otpExpires: null, otpName: null },
    });

    const secret = getSecret();
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ message: "Authenticated" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Verification failed" },
      { status: 500 },
    );
  }
}
