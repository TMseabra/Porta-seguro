import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    // 8h (e não 30 dias): o perfil não é revalidado na BD a cada pedido.
    maxAge: 8 * 60 * 60,
  },

  callbacks: {
    authorized({ auth, request }) {
      const autenticado = !!auth?.user;
      const caminho = request.nextUrl.pathname;

      if (caminho === "/login") {
        if (autenticado) {
          return Response.redirect(new URL("/painel", request.nextUrl));
        }
        return true;
      }

      return autenticado;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
