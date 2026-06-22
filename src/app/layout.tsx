import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Printify - Campus Printing Platform",
  description: "Upload documents, manage subscriptions, and track print jobs.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <SessionProvider session={session} basePath="/api/auth">
          {children}
        </SessionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "14px",
              fontSize: "0.88rem",
            },
            success: { iconTheme: { primary: "#34d399", secondary: "#fff" } },
            error: { iconTheme: { primary: "#fb7185", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
