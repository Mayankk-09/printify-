import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { packSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const packs = await prisma.pack.findMany({
    orderBy: { displayOrder: "asc" },
    where: isAdmin ? {} : { active: true },
  });

  return NextResponse.json(packs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = packSchema.parse(body);

    const existing = await prisma.pack.findUnique({ where: { slug: parsed.slug } });
    if (existing) {
      return NextResponse.json({ error: "A pack with this slug already exists" }, { status: 400 });
    }

    const pack = await prisma.pack.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        price: parsed.price,
        pages: parsed.pages,
        packType: parsed.packType,
        active: parsed.active,
        displayOrder: parsed.displayOrder,
      },
    });

    return NextResponse.json(pack, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create pack" }, { status: 500 });
  }
}
