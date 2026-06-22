import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadPrintClient from "./UploadPrintClient";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin/dashboard");

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id, status: "active" },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return <UploadPrintClient subscription={subscription} />;
}
