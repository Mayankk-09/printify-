import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/supabase-storage";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get("path");

    if (!storagePath) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        filePath: storagePath,
        OR: [
          { userId: session.user.id },
          { user: { role: "admin" } },
        ],
      },
      select: { id: true },
    });

    if (!order) {
      const uploadedFile = await prisma.uploadedFile.findFirst({
        where: {
          storedPath: storagePath,
          userId: session.user.id,
        },
        select: { id: true },
      });

      if (!uploadedFile && session.user.role !== "admin") {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    const url = await getSignedUrl(storagePath, 3600);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("[Files] Signed URL generation failed:", error.message);
    return NextResponse.json(
      { error: "Failed to generate file URL" },
      { status: 500 }
    );
  }
}
