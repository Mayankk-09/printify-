import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "./prisma";

type AuthResult = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
} | null;

function getSecret(): Uint8Array {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SECURITY BLOCK: SESSION_SECRET environment variable is missing!");
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function auth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    const userId = payload.userId as string;
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch {
    return null;
  }
}

export function getSecretKey(): Uint8Array {
  return getSecret();
}
