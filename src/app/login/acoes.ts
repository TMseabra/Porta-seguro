"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { verificarCredenciais } from "@/lib/autenticacao";
import { precisaDoisFatores, enviarNovoCodigo } from "@/lib/dois-fatores";

export type EstadoLogin = {
  passo: "credenciais" | "codigo";
  erro?: string;
  aviso?: string;
};

export async function entrarComCredenciais(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = formData.get("email");
  const password = formData.get("password");
  const codigo = String(formData.get("codigo") ?? "").trim();

  if (!codigo) {
    const utilizador = await verificarCredenciais(email, password);
    if (!utilizador) {
      return { passo: "credenciais", erro: "Email ou palavra-passe incorretos." };
    }

    if (precisaDoisFatores(utilizador.perfil)) {
      const enviado = await enviarNovoCodigo(utilizador.name, utilizador.email);
      if (!enviado) {
        // Falha fechada: se o código não sai, ninguém entra.
        return {
          passo: "credenciais",
          erro: "Não foi possível enviar o código de acesso. Tenta novamente daqui a pouco.",
        };
      }
      return {
        passo: "codigo",
        aviso: "Enviámos um código de 6 dígitos para o email desta conta. Escreve-o aqui.",
      };
    }
  }

  try {
    await signIn("credentials", { email, password, codigo, redirectTo: "/painel" });
  } catch (erro) {
    if (erro instanceof AuthError) {
      const passo = codigo ? "codigo" : "credenciais";
      switch (erro.type) {
        case "CredentialsSignin":
          return {
            passo,
            erro: codigo
              ? "Código incorreto ou expirado. Volta a tentar o login para receberes outro."
              : "Email ou palavra-passe incorretos.",
          };
        default:
          return { passo, erro: "Não foi possível iniciar sessão. Tenta novamente." };
      }
    }
    throw erro;
  }

  return { passo: "credenciais" };
}

export async function entrarComGoogle() {
  await signIn("google", { redirectTo: "/painel" });
}
