import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
p.addon.findMany().then(r => {
  console.log("Addons count:", r.length);
  console.log(JSON.stringify(r, null, 2));
  p.$disconnect();
}).catch(e => {
  console.error("Error:", e.message);
  p.$disconnect();
});
