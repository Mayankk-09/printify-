import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LandingClient from "./LandingClient";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/admin/dashboard");
    }
    redirect("/dashboard");
  }

  return <LandingClient />;
}
