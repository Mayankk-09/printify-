import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/admin/dashboard");
    }
    redirect("/dashboard");
  }

  redirect("/login");
}
