import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { planSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const plans = await prisma.plan.findMany({
    orderBy: { displayOrder: "asc" },
    where: isAdmin ? undefined : { active: true },
  });
  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const plan = await prisma.plan.create({ data: parsed.data });
    return NextResponse.json(plan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create plan" }, { status: 500 });
  }
}
