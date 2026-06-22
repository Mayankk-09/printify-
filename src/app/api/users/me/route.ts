import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dismissedPlanReminder } = body;

    if (typeof dismissedPlanReminder === "boolean") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { dismissedPlanReminder },
      });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
