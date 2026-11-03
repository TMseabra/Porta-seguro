import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/** No Next.js 16 chama-se "proxy" (antes "middleware"). */
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: [
    "/((?!api/auth|api/saude|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
