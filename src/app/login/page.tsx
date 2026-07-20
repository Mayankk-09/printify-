import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/admin/dashboard");
    }
    redirect("/dashboard");
  }

  return <LoginClient />;
}
