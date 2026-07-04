import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addonSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const addons = await prisma.addon.findMany({
    orderBy: { displayOrder: "asc" },
    where: isAdmin ? {} : { active: true },
  });

  return NextResponse.json(addons);
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = addonSchema.parse(body);

    const existing = await prisma.addon.findFirst({ where: { name: parsed.name } });
    if (existing) {
      return NextResponse.json({ error: "An add-on with this name already exists" }, { status: 400 });
    }

    const addon = await prisma.addon.create({ data: parsed });
    return NextResponse.json(addon, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create add-on" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Add-on ID required" }, { status: 400 });
    }

    const parsed = addonSchema.partial().parse(data);

    const addon = await prisma.addon.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(addon);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update add-on" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Add-on ID required" }, { status: 400 });
    }

    await prisma.addon.delete({ where: { id } });
    return NextResponse.json({ message: "Add-on deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete add-on" }, { status: 500 });
  }
}
