import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "Documents";

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Supabase Storage unavailable: NEXT_PUBLIC_SUPABASE_URL is not set."
    );
  }

  if (!serviceKey) {
    throw new Error(
      "Supabase Storage unavailable: SUPABASE_SERVICE_ROLE_KEY is not set."
    );
  }

  if (url.includes("/rest/v1") || url.includes("/storage/v1")) {
    console.error(
      "[Storage] NEXT_PUBLIC_SUPABASE_URL contains an API path suffix. " +
      "It should be the base project URL only, e.g. https://xxxxx.supabase.co"
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getStoragePath(
  userId: string,
  originalName: string
): string {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  const path = `${userId}/${ts}-${rand}-${safe}`;

  if (path.startsWith("/") || path.includes("//") || !path || path === "/") {
    throw new Error(`[Storage] Invalid generated path: "${path}"`);
  }

  return path;
}

export async function uploadToStorage(
  buffer: Buffer,
  storagePath: string,
  contentType: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  console.log("[Storage] Upload starting:", {
    bucket: BUCKET,
    path: storagePath,
    contentType,
    bufferSize: buffer.length,
  });

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    const detail = {
      bucket: BUCKET,
      path: storagePath,
      contentType,
      bufferSize: buffer.length,
      supabaseStatus: error.statusCode || "unknown",
      supabaseMessage: error.message,
      supabaseName: error.name,
    };
    console.error("[Storage] Upload failed:", JSON.stringify(detail, null, 2));
    throw new Error(
      `Storage upload failed: ${error.message} (status: ${error.statusCode || "unknown"}, path: ${storagePath})`
    );
  }

  console.log("[Storage] Upload succeeded:", {
    path: storagePath,
    id: data?.id,
  });
}

export async function deleteFromStorage(
  storagePath: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error("[Storage] Delete failed:", {
      bucket: BUCKET,
      path: storagePath,
      supabaseStatus: error.statusCode || "unknown",
      supabaseMessage: error.message,
    });
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}

export async function getSignedUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    console.error("[Storage] Signed URL generation failed:", {
      bucket: BUCKET,
      path: storagePath,
      supabaseStatus: error.statusCode || "unknown",
      supabaseMessage: error.message,
    });
    throw new Error(`Signed URL failed: ${error.message}`);
  }

  return data.signedUrl;
}

export async function deleteExpiredFiles(
  storagePaths: string[]
): Promise<{ deleted: number; failed: number }> {
  if (storagePaths.length === 0) return { deleted: 0, failed: 0 };

  const supabase = getSupabaseAdmin();
  let deleted = 0;
  let failed = 0;

  const BATCH_SIZE = 100;
  for (let i = 0; i < storagePaths.length; i += BATCH_SIZE) {
    const batch = storagePaths.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) {
      console.error("[Storage] Batch delete failed:", error.message);
      failed += batch.length;
    } else {
      deleted += batch.length;
    }
  }

  return { deleted, failed };
}
