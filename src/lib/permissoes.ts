import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Perfil } from "@/lib/constantes";

export async function exigirSessao() {
  const sessao = await auth();
  if (!sessao?.user) {
    redirect("/login");
  }
  return sessao;
}

export async function exigirPerfil(perfisPermitidos: Perfil[]) {
  const sessao = await exigirSessao();
  if (!perfisPermitidos.includes(sessao.user.perfil)) {
    redirect("/painel?erro=sem-permissao");
  }
  return sessao;
}
