import { prisma } from "@/lib/prisma";
import {
  deleteFromStorage,
  deleteExpiredFiles,
} from "@/lib/supabase-storage";

const DOCUMENT_RETENTION_HOURS = 48;

export interface DocumentCleanupResult {
  ordersProcessed: number;
  filesDeleted: number;
  recordsCleaned: number;
  skipped: number;
  errors: string[];
}

export interface UserCleanupResult {
  usersDeleted: number;
  storageFilesDeleted: number;
  storageFilesFailed: number;
  dbRecordsDeleted: number;
  errors: string[];
}

export async function runDocumentCleanup(): Promise<DocumentCleanupResult> {
  const result: DocumentCleanupResult = {
    ordersProcessed: 0,
    filesDeleted: 0,
    recordsCleaned: 0,
    skipped: 0,
    errors: [],
  };

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - DOCUMENT_RETENTION_HOURS);

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: "COLLECTED",
      collectedAt: { not: null, lt: cutoff },
      filePath: { not: null },
    },
    select: {
      id: true,
      orderNumber: true,
      filePath: true,
      fileName: true,
    },
  });

  console.log(
    `[Cleanup] Found ${expiredOrders.length} orders eligible for document retention cleanup`
  );

  for (const order of expiredOrders) {
    result.ordersProcessed++;

    if (!order.filePath) {
      result.skipped++;
      continue;
    }

    try {
      await deleteFromStorage(order.filePath);
      console.log(
        `[Cleanup] Storage deleted: ${order.orderNumber} → ${order.filePath}`
      );
    } catch (err: any) {
      const msg = err.message || String(err);

      if (
        msg.includes("not found") ||
        msg.includes("NoSuchKey") ||
        msg.includes("The resource was not found") ||
        msg.includes("Bucket not found")
      ) {
        console.log(
          `[Cleanup] File already absent in storage: ${order.orderNumber} → ${order.filePath}`
        );
      } else {
        console.error(
          `[Cleanup] Storage delete FAILED for ${order.orderNumber}: ${msg}`
        );
        result.errors.push(
          `Storage delete failed for ${order.orderNumber}: ${msg}`
        );
        result.skipped++;
        continue;
      }
    }

    try {
      const pathToDelete = order.filePath;
      await prisma.$transaction(async (tx) => {
        await tx.uploadedFile.deleteMany({
          where: { storedPath: pathToDelete! },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            filePath: null,
            fileName: null,
            fileSize: null,
          },
        });
      });

      result.filesDeleted++;
      result.recordsCleaned++;
      console.log(
        `[Cleanup] DB cleaned: ${order.orderNumber} — metadata nulled, UploadedFile removed`
      );
    } catch (err: any) {
      console.error(
        `[Cleanup] DB cleanup FAILED for ${order.orderNumber}: ${err.message}`
      );
      result.errors.push(
        `DB cleanup failed for ${order.orderNumber}: ${err.message}`
      );
    }
  }

  console.log(
    `[Cleanup] Document retention complete: ` +
      `${result.filesDeleted} files deleted, ` +
      `${result.recordsCleaned} records cleaned, ` +
      `${result.skipped} skipped, ` +
      `${result.errors.length} errors`
  );

  return result;
}

export async function runUserCleanup(): Promise<UserCleanupResult> {
  const result: UserCleanupResult = {
    usersDeleted: 0,
    storageFilesDeleted: 0,
    storageFilesFailed: 0,
    dbRecordsDeleted: 0,
    errors: [],
  };

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, email: true },
  });

  if (students.length === 0) {
    console.log("[UserCleanup] No student accounts found.");
    return result;
  }

  const studentIds = students.map((s) => s.id);

  const uploadedFiles = await prisma.uploadedFile.findMany({
    where: { userId: { in: studentIds } },
    select: { storedPath: true },
  });

  const storagePaths = uploadedFiles
    .map((f) => f.storedPath)
    .filter((p): p is string => !!p && p.length > 0);

  if (storagePaths.length > 0) {
    const storageResult = await deleteExpiredFiles(storagePaths);
    result.storageFilesDeleted = storageResult.deleted;
    result.storageFilesFailed = storageResult.failed;

    console.log(
      `[UserCleanup] Storage: ${storageResult.deleted} deleted, ${storageResult.failed} failed`
    );

    if (storageResult.failed > 0) {
      result.errors.push(
        `${storageResult.failed} storage files could not be deleted`
      );
    }
  }

  const orders = await prisma.order.findMany({
    where: { userId: { in: studentIds } },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);

  await prisma.$transaction(async (tx) => {
    if (orderIds.length > 0) {
      await tx.pickupCode.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await tx.orderAddon.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await tx.orderPack.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await tx.order.deleteMany({
        where: { id: { in: orderIds } },
      });
    }

    await tx.payment.deleteMany({
      where: { userId: { in: studentIds } },
    });
    await tx.subscription.deleteMany({
      where: { userId: { in: studentIds } },
    });
    await tx.uploadedFile.deleteMany({
      where: { userId: { in: studentIds } },
    });
    await tx.userCoupon.deleteMany({
      where: { userId: { in: studentIds } },
    });
    await tx.user.deleteMany({
      where: { id: { in: studentIds } },
    });
  });

  result.usersDeleted = students.length;
  result.dbRecordsDeleted =
    orderIds.length +
    studentIds.length;

  console.log(
    `[UserCleanup] Complete: ${result.usersDeleted} users deleted, ` +
      `${result.storageFilesDeleted} storage files removed, ` +
      `${result.dbRecordsDeleted} DB records cleaned`
  );

  return result;
}
