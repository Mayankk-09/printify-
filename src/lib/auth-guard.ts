import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}

export async function requireStudent() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/admin/dashboard");
  return session;
}

export async function getOptionalSession() {
  return await auth();
}
