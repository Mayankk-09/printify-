import { NextResponse } from "next/server";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractPageCount } from "@/lib/pageCount";
import { uploadToStorage, getStoragePath } from "@/lib/supabase-storage";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
const REJECTED_EXTENSIONS = [".exe", ".zip", ".rar"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();

    if (REJECTED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "This file type is not supported for printing." },
        { status: 400 }
      );
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Supported formats: PDF, DOC, DOCX, PPT, PPTX" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be 15MB or less" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = getStoragePath(userId, file.name);
    const contentType = file.type || "application/octet-stream";

    console.log("[Upload] Received file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      instanceofFile: file instanceof File,
      instanceofBlob: file instanceof Blob,
      bufferLength: buffer.length,
      ext,
      userId,
      generatedPath: storagePath,
      contentType,
    });

    await uploadToStorage(buffer, storagePath, contentType);

    const { pages, pending } = await extractPageCount(buffer, ext);

    await prisma.uploadedFile.create({
      data: {
        userId,
        originalName: file.name,
        storedPath: storagePath,
        mimeType: contentType,
        size: file.size,
        pageCount: pages,
        pageCountPending: pending,
      },
    });

    const response: Record<string, any> = {
      fileName: file.name,
      filePath: storagePath,
      fileSize: file.size,
      pages,
    };

    if (pending || !pages || pages < 1) {
      response.pageCountPending = true;
      response.warning = "Page count will be verified by the print operator.";
      if (!pages || pages < 1) {
        response.pages = 1;
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
