import { PrismaClient } from "@prisma/client";
import { runUserCleanup } from "../src/lib/cleanup";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing all student data (including Supabase Storage files)...\n");

  const result = await runUserCleanup();

  console.log("\n--- Results ---");
  console.log(`Users deleted:          ${result.usersDeleted}`);
  console.log(`Storage files deleted:  ${result.storageFilesDeleted}`);
  console.log(`Storage files failed:   ${result.storageFilesFailed}`);
  console.log(`DB records cleaned:     ${result.dbRecordsDeleted}`);

  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }

  console.log("\nAdmin accounts preserved.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
