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

/**
 * Admin e gestor são expulsos à meia-noite de Lisboa, além do limite geral de 8h: têm poder sobre
 * os dados de todos e uma sessão esquecida num computador da escola não deve durar mais que o dia.
 * Nos outros perfis devolve undefined (vale só o maxAge).
 */
function fimDaSessao(perfil: Perfil): number | undefined {
  if (perfil !== "admin" && perfil !== "gestor") return undefined;
  return limitesDoDiaEmLisboa(new Date()).fim.getTime();
}

async function ipDoPedido(): Promise<string | undefined> {
  try {
    const cabecalhos = await headers();
    return cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim();
  } catch {
    // Fora de um pedido HTTP não há cabeçalhos: o aviso sai sem o endereço.
    return undefined;
  }
}

/**
 * Configuração completa do Auth.js (RF13): email + palavra-passe e Google.
 * Só corre em Node, nunca no proxy (ver auth.config.ts).
 */
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
          // Só para registar de onde veio uma falha. O bloqueio é por conta, nunca por IP:
          // é falsificável e bastava trocar de rede.
          pedido.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        ),
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // select_account: obriga a escolher a conta, em vez de entrar logo com a que já está aberta.
      authorization: { params: { prompt: "select_account" } },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    // Só entra por Google quem já tem conta na escola: o Google só confirma o email, quem pode usar
    // o sistema decidimos nós.
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await ligarBaseDados();
        const existente = await Utilizador.findOne({
          email: user.email?.toLowerCase(),
        });
        if (!existente) return false;

        // Contas com 2FA não entram pelo Google: seria uma porta lateral que contornava o código por email.
        if (precisaDoisFatores(existente.perfil)) return false;

        return true;
      }
      return true;
    },

    // Só corre no login (`user` só vem aí); nos pedidos seguintes o Auth.js reutiliza o token.
    async jwt({ token, user }) {
      if (user?.perfil) {
        // Credentials: autorizarCredenciais() já confirmou tudo.
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
        // Google: o perfil vem sempre da nossa BD (o Google não sabe se a pessoa é porteiro ou admin).
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

      // Devolver null faz o Auth.js apagar o cookie de sessão (confirmado em
      // @auth/core/lib/actions/session.js): é assim que a sessão de admin/gestor morre à meia-noite.
      // Corre em todos os pedidos, não só no login.
      if (token.expiraEm && Date.now() > token.expiraEm) {
        return null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.idUtilizador ?? "";
        // Sem perfil no token assume-se o de menos permissões: mais vale falhar a fechar do que a abrir.
        session.user.perfil = token.perfil ?? "aluno";
      }
      return session;
    },
  },
});
