import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadPrintClient from "./UploadPrintClient";
import { getPickupSettings } from "@/lib/pickup";

export default async function UploadPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin/dashboard");

  const [subscriptions, user, addons, packs, pickupSettings] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: session.user.id, status: "active" },
      include: { pack: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.addon.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }),
    prisma.pack.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }),
    getPickupSettings(),
  ]);

  if (!user) redirect("/login?reason=expired");

  const totalAllowed = subscriptions.reduce((s, sub) => s + sub.pagesAllowed, 0);
  const totalUsed = subscriptions.reduce((s, sub) => s + sub.pagesUsed, 0);

  return (
    <UploadPrintClient
      subscriptions={subscriptions}
      totalAllowed={totalAllowed}
      totalUsed={totalUsed}
      user={user}
      initialAddons={addons}
      initialPacks={packs}
      initialPickupSettings={pickupSettings}
    />
  );
}
