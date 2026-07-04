import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { packSchema } from "@/lib/validations";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = packSchema.partial().parse(body);

    const existing = await prisma.pack.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (parsed.slug && parsed.slug !== existing.slug) {
      const slugExists = await prisma.pack.findUnique({ where: { slug: parsed.slug } });
      if (slugExists) {
        return NextResponse.json({ error: "A pack with this slug already exists" }, { status: 400 });
      }
    }

    const pack = await prisma.pack.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(pack);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update pack" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.subscription.deleteMany({ where: { packId: id } });
    await prisma.pack.delete({ where: { id } });
    return NextResponse.json({ message: "Pack deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete pack" }, { status: 500 });
  }
}
