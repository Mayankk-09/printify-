import { PrismaClient, PackType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@printify.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@printify.com",
      passwordHash: await hash("admin123", 10),
      role: "admin",
    },
  });
  console.log(`Admin: ${admin.email}`);

  const packs = [
    { name: "50 Pages Pack", slug: "50-pages", price: 24900, pages: 50, packType: PackType.BW_AND_COLOR, displayOrder: 1 },
    { name: "100 Pages Pack", slug: "100-pages", price: 39900, pages: 100, packType: PackType.BW_AND_COLOR, displayOrder: 2 },
    { name: "150 Pages Pack", slug: "150-pages", price: 54900, pages: 150, packType: PackType.BW_AND_COLOR, displayOrder: 3 },
  ];

  for (const pack of packs) {
    await prisma.pack.upsert({
      where: { slug: pack.slug },
      update: pack,
      create: pack,
    });
  }
  console.log(`Seeded ${packs.length} packs`);

  const defaultAddons = [
    { name: "Staple", description: "Staple binding", price: 200, displayOrder: 1 },
    { name: "Punch Holes", description: "Punch holes for filing", price: 100, displayOrder: 2 },
    { name: "Cobra File", description: "Cobra file binding", price: 2000, displayOrder: 3 },
    { name: "Clear Cover", description: "Transparent cover", price: 1000, displayOrder: 4 },
    { name: "Folder", description: "Cardboard folder", price: 1500, displayOrder: 5 },
  ];

  for (const addon of defaultAddons) {
    const existing = await prisma.addon.findFirst({ where: { name: addon.name } });
    if (!existing) {
      await prisma.addon.create({ data: addon });
    }
  }
  console.log(`Seeded ${defaultAddons.length} add-ons`);

  const defaultSettings: { key: string; value: string; type: string }[] = [
    { key: "pagePriceBW", value: "500", type: "number" },
    { key: "pagePriceColor", value: "1000", type: "number" },
    { key: "maxFileSize", value: "15728640", type: "number" },
    { key: "allowedFileTypes", value: "pdf,doc,docx,ppt,pptx", type: "string" },
    { key: "trialMaxPages", value: "5", type: "number" },
    { key: "trialPrintMode", value: "BW", type: "string" },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log(`Seeded ${defaultSettings.length} system settings`);

  const existingPickupSetting = await prisma.pickupSetting.findFirst();
  if (!existingPickupSetting) {
    await prisma.pickupSetting.create({
      data: {
        cutoffTime: "14:00",
        maxAdvanceDays: 7,
        workingDays: "1,2,3,4,5,6",
        slots: "09:00-10:40,10:40-12:20,12:20-14:00,14:00-15:40,15:40-17:20",
      },
    });
    console.log("Seeded pickup settings");
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
