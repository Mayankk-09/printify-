import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin/dashboard");

  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, createdAt: true },
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "active" },
      include: { pack: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login?reason=expired");

  return <ProfileClient user={user} subscription={subscription} />;
}
