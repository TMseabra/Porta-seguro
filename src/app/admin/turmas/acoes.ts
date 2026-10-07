"use server";

import { redirect } from "next/navigation";
import { ligarBaseDados } from "@/lib/mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { Turma, Horario, Utilizador } from "@/models";
import { mensagemDeErroMongoose } from "../erros";
import { passkeyValida, ERRO_PASSKEY } from "../passkey";

function lerCampos(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    ano: Number(formData.get("ano")),
    cursoId: String(formData.get("cursoId") ?? "").trim(),
    diretorTurmaId: String(formData.get("diretorTurmaId") ?? "").trim() || undefined,
  };
}

export async function criarTurma(
  _estadoAnterior: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const dados = lerCampos(formData);
  if (!dados.nome || !dados.ano || !dados.cursoId) {
    return "Preenche o nome, o ano e o curso.";
  }

  try {
    await Turma.create(dados);
  } catch (erro) {
    return mensagemDeErroMongoose(erro, "Já existe uma turma com esse nome.");
  }

  redirect("/admin/turmas");
}

export async function atualizarTurma(
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
  if (!dados.nome || !dados.ano || !dados.cursoId) {
    return "Preenche o nome, o ano e o curso.";
  }

  try {
    await Turma.findByIdAndUpdate(id, dados, { runValidators: true });
  } catch (erro) {
    return mensagemDeErroMongoose(erro, "Já existe uma turma com esse nome.");
  }

  redirect(`/admin/turmas/${id}`);
}

/** Apaga os horários da turma e deixa os alunos sem turma, em vez de apontarem para uma que não existe. */
export async function removerTurma(formData: FormData): Promise<void> {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const id = String(formData.get("id") ?? "");

  if (!passkeyValida(formData)) {
    redirect(`/admin/turmas?erro=${encodeURIComponent(ERRO_PASSKEY)}`);
  }

  await Horario.deleteMany({ turmaId: id });
  await Utilizador.updateMany({ turmaId: id }, { $unset: { turmaId: "" } });
  await Turma.findByIdAndDelete(id);

  redirect("/admin/turmas");
}
