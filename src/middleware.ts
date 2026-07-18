import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret(): Uint8Array {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SECURITY BLOCK: SESSION_SECRET environment variable is missing!");
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

function isAdminPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/");
}

const protectedPaths = [
  "/admin",
  "/dashboard",
  "/upload",
  "/subscribe",
  "/orders",
  "/profile",
];

function isProtected(path: string): boolean {
  return protectedPaths.some((p) => path === p || path.startsWith(p + "/"));
}

const publicPaths = ["/", "/login", "/register", "/api/auth"];

function isPublic(path: string): boolean {
  return publicPaths.some((p) => path === p || path.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  if (isProtected(pathname)) {
    const token = request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.rewrite(new URL("/login", request.url));
    }

    let payload;
    try {
      const verified = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
      payload = verified.payload;
    } catch {
      const res = NextResponse.rewrite(new URL("/login", request.url));
      res.cookies.delete("session");
      return res;
    }

    if (isAdminPath(pathname) && payload.role !== "admin") {
      return NextResponse.rewrite(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
