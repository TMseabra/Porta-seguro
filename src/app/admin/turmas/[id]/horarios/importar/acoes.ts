"use server";

/**
 * Importação de horário por Excel (RF10): `analisarExcel` só lê e pré-visualiza; `confirmarImportacao`
 * substitui o horário da turma (por isso pede a palavra-chave de confirmação).
 */

import * as XLSX from "xlsx";
import { ligarBaseDados } from "@/lib/mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { Horario, Turma, Utilizador } from "@/models";
import { interpretarLinhasExcel, type LinhaImportada } from "@/lib/importarHorario";
import { passkeyValida, ERRO_PASSKEY } from "../../../../passkey";

export type ResultadoAnalise =
  | { ok: false; erro: string }
  | { ok: true; turmaNome: string; linhas: LinhaImportada[] };

export async function analisarExcel(turmaId: string, formData: FormData): Promise<ResultadoAnalise> {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const turma = await Turma.findById(turmaId).select("nome").lean();
  if (!turma) {
    return { ok: false, erro: "Turma não encontrada." };
  }

  const ficheiro = formData.get("ficheiro");
  if (!(ficheiro instanceof File) || ficheiro.size === 0) {
    return { ok: false, erro: "Escolhe um ficheiro Excel (.xlsx)." };
  }

  // Um horário são dezenas de linhas; o limite evita descomprimir ficheiros enormes em memória.
  const MAX_BYTES = 2 * 1024 * 1024;
  if (ficheiro.size > MAX_BYTES) {
    return { ok: false, erro: "O ficheiro é demasiado grande (máximo 2 MB)." };
  }

  let livro: XLSX.WorkBook;
  try {
    const bytes = await ficheiro.arrayBuffer();
    livro = XLSX.read(bytes, { type: "array" });
  } catch {
    return { ok: false, erro: "Não foi possível ler este ficheiro. Confirma que é um Excel válido." };
  }

  const nomeFolha = livro.SheetNames[0];
  if (!nomeFolha) {
    return { ok: false, erro: "O ficheiro não tem nenhuma folha." };
  }
  const folha = livro.Sheets[nomeFolha];
  const linhasBrutas = XLSX.utils.sheet_to_json<Record<string, unknown>>(folha, { defval: "" });

  if (linhasBrutas.length === 0) {
    return { ok: false, erro: "A folha não tem nenhuma linha de dados (só o cabeçalho, ou está vazia)." };
  }

  const professores = await Utilizador.find({ perfil: { $in: ["professor", "dt"] } })
    .select("nomeCompleto")
    .lean();
  const professoresDisponiveis = professores.map((p) => ({ id: p._id.toString(), nome: p.nomeCompleto }));

  const linhas = interpretarLinhasExcel(linhasBrutas, professoresDisponiveis);

  return { ok: true, turmaNome: turma.nome, linhas };
}

export type ResultadoImportacao = { ok: true; total: number } | { ok: false; erro: string };

/** Substitui TODO o horário da turma numa operação só, para nunca ficar sem horário se algo falhar. */
export async function confirmarImportacao(
  turmaId: string,
  linhas: LinhaImportada[],
  passkeyDigitada: string,
): Promise<ResultadoImportacao> {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const formDataPasskey = new FormData();
  formDataPasskey.set("passkey", passkeyDigitada);
  if (!passkeyValida(formDataPasskey)) {
    return { ok: false, erro: ERRO_PASSKEY };
  }

  const turma = await Turma.findById(turmaId).lean();
  if (!turma) {
    return { ok: false, erro: "Turma não encontrada." };
  }

  const linhasValidas = linhas.filter((linha) => linha.erros.length === 0);
  if (linhasValidas.length === 0) {
    return { ok: false, erro: "Não há nenhuma linha válida para importar." };
  }

  // Transação só aqui: sem ela, uma falha depois de apagar os blocos antigos deixava a turma sem horário.
  const session = await Horario.startSession();
  try {
    await session.withTransaction(async () => {
      await Horario.deleteMany({ turmaId }, { session });
      await Horario.insertMany(
        linhasValidas.map((linha) => ({
          turmaId,
          diaSemana: linha.diaSemana,
          horaInicio: linha.horaInicio,
          horaFim: linha.horaFim,
          disciplina: linha.disciplina,
          professorId: linha.professorId,
          sala: linha.sala,
        })),
        { session },
      );
    });
  } catch (erro) {
    return {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Não foi possível importar o horário.",
    };
  } finally {
    await session.endSession();
  }

  return { ok: true, total: linhasValidas.length };
}
