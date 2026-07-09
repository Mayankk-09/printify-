export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const otpCache = new Map<string, { otp: string; name: string; expires: number }>();

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const cacheKey = email.toLowerCase().trim();
    otpCache.set(cacheKey, { otp, name: name || "", expires: Date.now() + 5 * 60 * 1000 });

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

    console.log("[SEND-OTP:PUT] email:", JSON.stringify(sanitizedEmail));
    console.log("[SEND-OTP:PUT] otp:", JSON.stringify(sanitizedOtp));

    if (!sanitizedEmail || !sanitizedOtp) {
      return NextResponse.json({ success: false, error: "Email and code are required" }, { status: 400 });
    }

    const cachedData = otpCache.get(sanitizedEmail);

    if (!cachedData || Date.now() > cachedData.expires) {
      if (cachedData) otpCache.delete(sanitizedEmail);
      return NextResponse.json({ success: false, error: "Invalid or expired key." }, { status: 401 });
    }

    if (cachedData.otp !== sanitizedOtp) {
      return NextResponse.json({ success: false, error: "Invalid or expired key." }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      const userName = sanitizedName || cachedData.name || "Campus Student";
      user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          name: userName,
          role: "student",
          passwordHash: "otp-auth",
        },
      });
    }

    otpCache.delete(sanitizedEmail);

    return NextResponse.json({ success: true, message: "Authorized" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Verification failed" },
      { status: 500 },
    );
  }
}
