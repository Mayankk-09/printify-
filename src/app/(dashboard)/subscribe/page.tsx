import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SubscribeClient from "./SubscribeClient";

export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin/dashboard");

  const [packs, subscriptions, user] = await Promise.all([
    prisma.pack.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.subscription.findMany({
      where: { userId: session.user.id, status: "active" },
      include: { pack: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        freeTrialClaimed: true,
        freeTrialClaimedAt: true,
        freeTrialUsed: true,
        freeTrialUsedAt: true,
      },
    }),
  ]);

  const totalAllowed = subscriptions.reduce((s, sub) => s + sub.pagesAllowed, 0);
  const totalUsed = subscriptions.reduce((s, sub) => s + sub.pagesUsed, 0);
  const remainingPages = Math.max(0, totalAllowed - totalUsed);

  return (
    <SubscribeClient
      initialPacks={packs}
      initialBalance={{
        subscriptions,
        totalAllowed,
        totalUsed,
        remainingPages,
      }}
      initialFreeTrial={{
        freeTrialClaimed: user?.freeTrialClaimed ?? false,
        freeTrialClaimedAt: user?.freeTrialClaimedAt ?? null,
        freeTrialUsed: user?.freeTrialUsed ?? false,
        freeTrialUsedAt: user?.freeTrialUsedAt ?? null,
      }}
    />
  );
}
