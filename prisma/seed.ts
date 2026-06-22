import { PrismaClient, UserRole } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@printify.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log("Seed data already exists, skipping.");
    return;
  }

  const admin = await prisma.user.create({
    data: {
      name: "Printify Admin",
      email: adminEmail,
      passwordHash: hashSync("admin123", 10),
      phone: "9999999999",
      role: UserRole.admin,
    },
  });

  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: "Starter",
        slug: "starter",
        description: "50 black & white pages per month. Ideal for light printing.",
        monthlyPrice: 249,
        pagesIncluded: 50,
        supportsColor: false,
        validityDays: 30,
        displayOrder: 1,
      },
    }),
    prisma.plan.create({
      data: {
        name: "Pro",
        slug: "pro",
        description: "100 black & white pages per month. Best value for regular printing.",
        monthlyPrice: 499,
        pagesIncluded: 100,
        supportsColor: false,
        validityDays: 30,
        displayOrder: 2,
      },
    }),
    prisma.plan.create({
      data: {
        name: "Premium",
        slug: "premium",
        description: "100 pages including color. For students who need color printing.",
        monthlyPrice: 749,
        pagesIncluded: 100,
        supportsColor: true,
        validityDays: 30,
        displayOrder: 3,
      },
    }),
  ]);

  await prisma.systemSetting.createMany({
    data: [
      { key: "bw_page_cost", value: "0.50", type: "number" },
      { key: "color_page_cost", value: "3.00", type: "number" },
      { key: "staple_cost", value: "0.10", type: "number" },
      { key: "punch_cost", value: "0.10", type: "number" },
      { key: "cobra_file_cost", value: "12.00", type: "number" },
      { key: "transparent_file_cost", value: "4.00", type: "number" },
      { key: "folder_cost", value: "8.00", type: "number" },
      { key: "max_file_size_mb", value: "15", type: "number" },
      { key: "allowed_file_types", value: "pdf,docx,pptx", type: "string" },
    ],
  });

  console.log(`Seed complete: Admin (${admin.email}), ${plans.length} plans created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
