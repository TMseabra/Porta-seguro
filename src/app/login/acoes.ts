"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { verificarCredenciais } from "@/lib/autenticacao";
import { precisaDoisFatores, enviarNovoCodigo } from "@/lib/dois-fatores";

/** Dois passos: contas normais entram logo; admin e gestor escrevem ainda o código de 6 dígitos do email. */
export type EstadoLogin = {
  passo: "credenciais" | "codigo";
  erro?: string;
  aviso?: string;
};

/** Usada com `useActionState`, por isso recebe o estado anterior. */
export async function entrarComCredenciais(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = formData.get("email");
  const password = formData.get("password");
  const codigo = String(formData.get("codigo") ?? "").trim();

  // 1.º passo: confirma a palavra-passe antes de enviar email, para ninguém fazer o sistema enviar emails a contas alheias.
  if (!codigo) {
    const utilizador = await verificarCredenciais(email, password);
    if (!utilizador) {
      return { passo: "credenciais", erro: "Email ou palavra-passe incorretos." };
    }

    if (precisaDoisFatores(utilizador.perfil)) {
      const enviado = await enviarNovoCodigo(utilizador.name, utilizador.email);
      if (!enviado) {
        // Falha fechada: se o código não sai, ninguém entra (senão o 2.º fator anulava-se quando mais falta faz).
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
    // Um signIn() com sucesso lança um erro especial só para redirecionar: tem de continuar a subir.
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
