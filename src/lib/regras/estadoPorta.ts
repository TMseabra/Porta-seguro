/**
 * Estado da porta para uma pessoa num momento, a partir do horário da turma. Função pura, como as outras
 * regras. Serve o porteiro: perceber de relance se a pessoa devia estar ali.
 * Não sabe se o movimento é entrada ou saída: só descreve o horário. Quem o usa decide o que `atrasado`
 * quer dizer (numa entrada, chegou tarde; numa saída, está a sair a meio de uma aula).
 */

import type { IHorario } from "@/models/Horario";
import { diaDaSemanaEmLisboa, minutosDoDiaEmLisboa, horaParaMinutos } from "@/lib/datas";
import { encontrarBlocoADecorrer } from "./horarios";

export type EstadoPorta = "aberta" | "fechada";

export interface ResultadoEstadoPorta {
  estado: EstadoPorta;
  motivo: string;
  /** Há uma aula já a decorrer na hora da leitura. */
  atrasado: boolean;
}

/**
 * Por ordem: sem blocos hoje -> fechada; aula a decorrer -> aberta e `atrasado`; antes da 1.ª aula ->
 * aberta, a horas; entre blocos -> aberta; depois do último bloco -> fechada.
 */
export function calcularEstadoPorta(
  horariosDaTurma: IHorario[],
  momento: Date,
): ResultadoEstadoPorta {
  const diaSemana = diaDaSemanaEmLisboa(momento);
  const blocosDeHoje = horariosDaTurma.filter((bloco) => bloco.diaSemana === diaSemana);

  if (blocosDeHoje.length === 0) {
    return {
      estado: "fechada",
      motivo: "Não há aulas para esta turma hoje.",
      atrasado: false,
    };
  }

  const blocoAtual = encontrarBlocoADecorrer(horariosDaTurma, momento);
  if (blocoAtual) {
    return {
      estado: "aberta",
      motivo: `Aula a decorrer: ${blocoAtual.disciplina} (${blocoAtual.horaInicio}–${blocoAtual.horaFim}).`,
      atrasado: true,
    };
  }

  const minutoAtual = minutosDoDiaEmLisboa(momento);
  const primeiroInicio = Math.min(...blocosDeHoje.map((b) => horaParaMinutos(b.horaInicio)));
  const ultimoFim = Math.max(...blocosDeHoje.map((b) => horaParaMinutos(b.horaFim)));

  if (minutoAtual < primeiroInicio) {
    const primeiroBloco = blocosDeHoje.find(
      (b) => horaParaMinutos(b.horaInicio) === primeiroInicio,
    );
    return {
      estado: "aberta",
      motivo: `Ainda a horas — as aulas começam às ${primeiroBloco?.horaInicio}.`,
      atrasado: false,
    };
  }

  if (minutoAtual >= ultimoFim) {
    return {
      estado: "fechada",
      motivo: "As aulas de hoje já terminaram.",
      atrasado: false,
    };
  }

  return {
    estado: "aberta",
    motivo: "Intervalo entre aulas.",
    atrasado: false,
  };
}
