import type { Session } from "next-auth";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

async function verifyUserExists(session: Session | null) {
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  return !!user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const exists = await verifyUserExists(session);
  if (!exists) redirect("/login?reason=expired");
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const exists = await verifyUserExists(session);
  if (!exists) redirect("/admin/login?reason=expired");
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}

export async function requireStudent() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const exists = await verifyUserExists(session);
  if (!exists) redirect("/login?reason=expired");
  if (session.user.role !== "student") redirect("/admin/dashboard");
  return session;
}

export async function getOptionalSession() {
  return await auth();
}
