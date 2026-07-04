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

  const orders = await prisma.order.findMany({
    where: { userId: { in: ids } },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);

  await prisma.$transaction([
    prisma.pickupCode.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
    prisma.payment.deleteMany({ where: { userId: { in: ids } } }),
    prisma.subscription.deleteMany({ where: { userId: { in: ids } } }),
    prisma.uploadedFile.deleteMany({ where: { userId: { in: ids } } }),
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
