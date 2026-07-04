import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [settings, pickupSetting] = await Promise.all([
    prisma.systemSetting.findMany(),
    prisma.pickupSetting.findFirst(),
  ]);

  return NextResponse.json({ settings, pickupSetting });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (body.settings && typeof body.settings === "object") {
      for (const [key, value] of Object.entries(body.settings)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), type: typeof value === "number" ? "number" : "string" },
        });
      }
    }

    if (body.pickupSettings) {
      const existing = await prisma.pickupSetting.findFirst();
      if (existing) {
        await prisma.pickupSetting.update({
          where: { id: existing.id },
          data: body.pickupSettings,
        });
      } else {
        await prisma.pickupSetting.create({ data: body.pickupSettings });
      }
    }

    return NextResponse.json({ message: "Settings updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
