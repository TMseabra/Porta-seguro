import type { NextAuthConfig } from "next-auth";

const PAGINAS_PUBLICAS = new Set(["/", "/funcionalidades", "/seguranca", "/sobre"]);

/**
 * Configuração "leve" do Auth.js: só decide quem pode ver que páginas. Fica separada do auth.ts para o
 * proxy não importar módulos nativos (Argon2id) nem o Mongoose; os fornecedores de login só existem no auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    // Qualquer erro do Auth.js (ex.: Google recusado) volta ao login.
    error: "/login",
  },

  session: {
    strategy: "jwt",
    // Um dia letivo. O perfil viaja no token e não é revalidado na BD a cada pedido, por isso um aluno
    // apagado ou suspenso continuaria a entrar até o token expirar: 8h (e não os 30 dias por omissão)
    // fecham essa janela.
    maxAge: 8 * 60 * 60,
  },

  callbacks: {
    authorized({ auth, request }) {
      const autenticado = !!auth?.user;
      const caminho = request.nextUrl.pathname;

      // Páginas de apresentação, públicas e sem redirecionar quem tem sessão. Lista fechada: uma página
      // nova só é pública se for acrescentada aqui.
      if (PAGINAS_PUBLICAS.has(caminho)) {
        return true;
      }

      if (caminho === "/login") {
        if (autenticado) {
          return Response.redirect(new URL("/painel", request.nextUrl));
        }
        return true;
      }

      // Qualquer outra página exige sessão; false faz o Auth.js redirecionar para o login.
      return autenticado;
    },
  },

  // Os fornecedores reais (Credentials, Google) estão em auth.ts.
  providers: [],
} satisfies NextAuthConfig;
