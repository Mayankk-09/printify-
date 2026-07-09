import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const key =
    process.env.SESSION_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "printify-fallback-dev-secret-change-in-production";
  return new TextEncoder().encode(key);
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
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  if (isProtected(pathname)) {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
