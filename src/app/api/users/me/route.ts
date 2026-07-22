import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      hasUsedTrial: true,
      hasClaimedTrial: true,
      claimedTrialAt: true,
      trialOrderId: true,
      trialUsedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updateData: Record<string, any> = {};

    if ("name" in body) {
      if (typeof body.name !== "string") {
        return NextResponse.json({ error: "Name must be text." }, { status: 400 });
      }
      const trimmed = body.name.trim();
      if (trimmed.length === 0) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      updateData.name = trimmed;
    }

    if ("phone" in body) {
      if (body.phone === null || body.phone === "") {
        updateData.phone = null;
      } else if (typeof body.phone === "string") {
        const digits = body.phone.replace(/\D/g, "");
        if (digits.length !== 10) {
          return NextResponse.json({ error: "Phone must be exactly 10 digits." }, { status: 400 });
        }
        updateData.phone = `+91 ${digits}`;
      } else {
        return NextResponse.json({ error: "Invalid phone value." }, { status: 400 });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
