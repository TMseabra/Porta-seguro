import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Instância própria do NextAuth com a configuração leve (ver auth.config.ts). No Next.js 16 chama-se
 * "proxy" (antes "middleware").
 */
const { auth } = NextAuth(authConfig);

// Tem de ser uma variável simples: o Next.js procura este padrão.
export const proxy = auth;

export const config = {
  matcher: [
    /*
     * Todos os pedidos exceto auth, saúde, ficheiros do Next e imagens de public/ (sem esta exceção, /logo.png
     * sem sessão era redirecionado para o login).
     */
    "/((?!api/auth|api/saude|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
