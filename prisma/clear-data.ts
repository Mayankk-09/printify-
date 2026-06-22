import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing all student data...");

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true },
  });

  const ids = students.map((s) => s.id);
  if (!ids.length) {
    console.log("No student data found.");
    return;
  }

  await prisma.$transaction([
    prisma.uploadedFile.deleteMany({ where: { userId: { in: ids } } }),
    prisma.auditLog.deleteMany({ where: { userId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);

  console.log(`Deleted ${ids.length} students and all their data. Admin preserved.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
