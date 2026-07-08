export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let { phone } = await request.json();
    console.log(">>> [SendOTP] Incoming phone payload from client:", phone);

    phone = (phone ?? "").replace(/^(\+|91)/, "");

    if (!phone || typeof phone !== "string" || !/^\d{10}$/.test(phone)) {
      console.log(">>> [SendOTP] Invalid phone number after sanitize:", phone);
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    console.log(">>> [SendOTP] Check env tokens - AuthKey:", !!process.env.MSG91_AUTH_KEY, " | TemplateID:", !!process.env.MSG91_TEMPLATE_ID);

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      console.log(">>> [SendOTP] Missing env configuration - AuthKey found:", !!authKey, " | TemplateID found:", !!templateId);
      return NextResponse.json({ error: "SMS service not configured" }, { status: 500 });
    }

    const formattedPhone = `91${phone}`;
    const bodyPayload = JSON.stringify({
      template_id: templateId,
      mobile: formattedPhone,
      otp_length: 6,
    });

    console.log(">>> [SendOTP] Firing fetch request to MSG91 endpoint...");
    console.log(">>> [SendOTP] Request body:", bodyPayload);

    let msg91Res: Response;

    try {
      msg91Res = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: authKey,
        },
        body: bodyPayload,
      });
    } catch (fetchError) {
      console.error(">>> [SendOTP] Network error while reaching MSG91:", fetchError);
      return NextResponse.json({ error: "Failed to reach SMS gateway" }, { status: 502 });
    }

    console.log(">>> [SendOTP] Raw MSG91 HTTP status:", msg91Res.status);

    const responseText = await msg91Res.text();
    console.log(">>> [SendOTP] Gateway Server Tracking Log:", responseText);

    if (!msg91Res.ok) {
      return NextResponse.json(
        { error: "Failed to send OTP" },
        { status: msg91Res.status },
      );
    }

    console.log(">>> [SendOTP] MSG91 accepted and dispatched OTP successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(">>> [SendOTP] Unexpected error in POST handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
