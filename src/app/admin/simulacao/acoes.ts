"use server";

/**
 * Simulação (só admin): as MESMAS regras e o mesmo `movimento.ts` do Portão Teste, a uma data/hora
 * escolhida. Os registos ficam com `metodo: "simulacao"` e são excluídos da assiduidade (RF07).
 */

import { ligarBaseDados } from "@/lib/mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { horaLisboaParaUtc } from "@/lib/datas";
import { Utilizador } from "@/models";
import {
  processarMovimento,
  confirmarSaidaComPais as confirmarSaidaComPaisPartilhado,
  type ResultadoMovimento,
  type ResultadoConfirmacao,
} from "@/lib/movimento";

/** `dataISO`/`horaISO` vêm de inputs date + time, interpretados como hora de Lisboa. */
export async function simularPassagem(
  alunoId: string,
  data: string,
  hora: string,
  tipo?: string,
): Promise<ResultadoMovimento> {
  const sessao = await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const aluno = await Utilizador.findOne({ _id: alunoId, perfil: "aluno" }).lean();
  if (!aluno) {
    return { ok: false, erro: "Aluno não encontrado." };
  }

  const momento = converterParaMomento(data, hora);
  if (!momento) {
    return { ok: false, erro: "Data ou hora inválida." };
  }

  // Vem do browser: uma Server Action é um endereço HTTP e o tipo TypeScript não existe em runtime.
  const tipoForcado = tipo === "entrada" || tipo === "saida" ? tipo : undefined;

  return processarMovimento(aluno, sessao.user.id, "simulacao", momento, tipoForcado);
}

export async function confirmarSaidaSimulada(
  alunoId: string,
  horarioId: string | undefined,
  momentoISO: string,
  paisAutorizaram: boolean,
): Promise<ResultadoConfirmacao> {
  const sessao = await exigirPerfil(["gestor", "admin"]);
  return confirmarSaidaComPaisPartilhado(
    alunoId,
    horarioId,
    momentoISO,
    "simulacao",
    paisAutorizaram,
    sessao.user.id,
  );
}

function converterParaMomento(data: string, hora: string): Date | null {
  const encaixeData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const encaixeHora = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!encaixeData || !encaixeHora) return null;

  const [, ano, mes, dia] = encaixeData;
  const [, horas, minutos] = encaixeHora;
  return horaLisboaParaUtc(Number(ano), Number(mes), Number(dia), Number(horas), Number(minutos));
}
