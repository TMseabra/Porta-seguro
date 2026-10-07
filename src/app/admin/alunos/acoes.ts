"use server";

import { redirect } from "next/navigation";
import { ligarBaseDados } from "@/lib/mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { hashPassword } from "@/lib/senha";
import { Utilizador, Registo, Ocorrencia, TokenQR } from "@/models";
import { mensagemDeErroMongoose } from "../erros";
import { passkeyValida, ERRO_PASSKEY } from "../passkey";

function lerCampos(formData: FormData) {
  return {
    nomeCompleto: String(formData.get("nomeCompleto") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    numeroAluno: formData.get("numeroAluno") ? Number(formData.get("numeroAluno")) : undefined,
    numeroCartao: String(formData.get("numeroCartao") ?? "").trim() || undefined,
    turmaId: String(formData.get("turmaId") ?? "").trim() || undefined,
    maiorIdade: formData.get("maiorIdade") === "on",
    autorizacaoPais: formData.get("autorizacaoPais") === "on",
    suspenso: formData.get("suspenso") === "on",
  };
}

export async function criarAluno(
  _estadoAnterior: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const dados = lerCampos(formData);
  if (!dados.nomeCompleto || !dados.email) {
    return "Preenche o nome e o email.";
  }

  const palavraPasseSimples = String(formData.get("palavraPasse") ?? "");

  try {
    await Utilizador.create({
      ...dados,
      perfil: "aluno",
      palavraPasse: palavraPasseSimples ? await hashPassword(palavraPasseSimples) : undefined,
    });
  } catch (erro) {
    return mensagemDeErroMongoose(erro, "Já existe um aluno com esse email, número ou cartão.");
  }

  redirect("/admin/alunos");
}

export async function atualizarAluno(
  _estadoAnterior: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  if (!passkeyValida(formData)) {
    return ERRO_PASSKEY;
  }

  const id = String(formData.get("id") ?? "");
  const dados = lerCampos(formData);
  if (!dados.nomeCompleto || !dados.email) {
    return "Preenche o nome e o email.";
  }

  const novaPalavraPasse = String(formData.get("palavraPasse") ?? "");

  try {
    // `perfil: "aluno"` é segurança, não otimização: sem ele aceitava-se o id de qualquer utilizador e um
    // gestor mudava a password do admin e entrava como ele. O id vem do browser.
    const aluno = await Utilizador.findOne({ _id: id, perfil: "aluno" });
    if (!aluno) return "Aluno não encontrado.";

    Object.assign(aluno, dados);

    if (novaPalavraPasse) {
      aluno.palavraPasse = await hashPassword(novaPalavraPasse);
    }
    await aluno.save();
  } catch (erro) {
    return mensagemDeErroMongoose(erro, "Já existe um aluno com esse email, número ou cartão.");
  }

  redirect("/admin/alunos");
}

/** Leva o histórico (registos, ocorrências, códigos QR): sem o aluno, falsearia os relatórios. */
export async function removerAluno(formData: FormData): Promise<void> {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const id = String(formData.get("id") ?? "");

  if (!passkeyValida(formData)) {
    redirect(`/admin/alunos?erro=${encodeURIComponent(ERRO_PASSKEY)}`);
  }

  // Mesma razão de segurança que em `atualizarAluno`. Só se apagou um aluno é que se apaga o histórico.
  const aluno = await Utilizador.findOneAndDelete({ _id: id, perfil: "aluno" });
  if (!aluno) {
    redirect(`/admin/alunos?erro=${encodeURIComponent("Aluno não encontrado.")}`);
  }

  await Promise.all([
    Registo.deleteMany({ alunoId: aluno._id }),
    Ocorrencia.deleteMany({ alunoId: aluno._id }),
    TokenQR.deleteMany({ alunoId: aluno._id }),
  ]);

  redirect("/admin/alunos");
}
