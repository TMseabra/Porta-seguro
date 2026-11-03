import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { headers } from "next/headers";

import { authConfig } from "./auth.config";
import { autorizarCredenciais } from "@/lib/autenticacao";
import { precisaDoisFatores } from "@/lib/dois-fatores";
import { ligarBaseDados } from "@/lib/mongoose";
import { Utilizador } from "@/models";
import { notificarLogin } from "@/lib/notificacoes";
import { limitesDoDiaEmLisboa } from "@/lib/datas";
import type { Perfil } from "@/lib/constantes";

function fimDaSessao(perfil: Perfil): number | undefined {
  if (perfil !== "admin" && perfil !== "gestor") return undefined;
  return limitesDoDiaEmLisboa(new Date()).fim.getTime();
}

async function ipDoPedido(): Promise<string | undefined> {
  try {
    const cabecalhos = await headers();
    return cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim();
  } catch {
    return undefined;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Palavra-passe", type: "password" },
        codigo: { label: "Código de acesso", type: "text" },
      },
      authorize: (credenciais, pedido) =>
        autorizarCredenciais(
          credenciais?.email,
          credenciais?.password,
          credenciais?.codigo,
          pedido.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        ),
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    // O Google só confirma o email: quem pode entrar decidimos nós.
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await ligarBaseDados();
        const existente = await Utilizador.findOne({
          email: user.email?.toLowerCase(),
        });
        if (!existente) return false;

        // Contas com 2FA não entram pelo Google: contornava o código por email.
        if (precisaDoisFatores(existente.perfil)) return false;

        return true;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.perfil) {
        token.idUtilizador = user.id;
        token.perfil = user.perfil;
        token.expiraEm = fimDaSessao(user.perfil);
        await notificarLogin(
          user.name ?? user.email ?? "?",
          user.email ?? "",
          user.perfil,
          await ipDoPedido(),
        );
      } else if (user?.email) {
        await ligarBaseDados();
        const utilizador = await Utilizador.findOne({
          email: user.email.toLowerCase(),
        });
        if (utilizador) {
          token.idUtilizador = utilizador._id.toString();
          token.perfil = utilizador.perfil;
          token.name = utilizador.nomeCompleto;
          token.expiraEm = fimDaSessao(utilizador.perfil);
          await notificarLogin(
            utilizador.nomeCompleto,
            utilizador.email,
            utilizador.perfil,
            await ipDoPedido(),
          );
        }
      }

      if (token.expiraEm && Date.now() > token.expiraEm) {
        return null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.idUtilizador ?? "";
        session.user.perfil = token.perfil ?? "aluno";
      }
      return session;
    },
  },
});
