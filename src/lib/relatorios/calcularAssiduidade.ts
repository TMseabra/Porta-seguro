/**
 * Presenças, faltas e atrasos (RF05). Função pura: nunca se guardam, recalculam-se sempre a partir de
 * `horarios` + `registos`.
 */

import type { Types } from "mongoose";
import { diaDaSemanaEmLisboa, limitesDoDiaEmLisboa } from "@/lib/datas";
import type { TipoRegisto, EstadoRegisto } from "@/lib/constantes";

export interface RegistoParaAssiduidade {
  tipo: TipoRegisto;
  estado: EstadoRegisto;
  dataHora: Date;
  horarioId?: Types.ObjectId | string;
}

export type SituacaoDia = "presenca" | "presenca_atraso" | "falta";

export interface DiaAssiduidade {
  data: Date;
  situacao: SituacaoDia;
  horaEntrada?: Date;
}

export interface ResultadoAssiduidade {
  diasLetivos: number;
  presencas: number;
  atrasos: number;
  faltas: number;
  taxaPresenca: number;
  dias: DiaAssiduidade[];
}

/**
 * Dia letivo = há pelo menos um bloco nesse dia da semana (não há calendário escolar). Presença = há
 * entrada autorizada; atraso = essa entrada tem `horarioId`. Sem entrada autorizada (incluindo bloqueio
 * por suspensão) é falta.
 */
export function calcularAssiduidade(
  horariosDaTurma: Array<{ diaSemana: number }>,
  registosDoAluno: RegistoParaAssiduidade[],
  periodo: { inicio: Date; fim: Date },
): ResultadoAssiduidade {
  const diasComAula = new Set(horariosDaTurma.map((h) => h.diaSemana));
  const dias: DiaAssiduidade[] = [];

  // Recalcula os limites de cada dia em Lisboa em vez de somar 24h, por causa das mudanças de hora.
  let cursor = limitesDoDiaEmLisboa(periodo.inicio).inicio;

  while (cursor < periodo.fim) {
    const { inicio: inicioDoDia, fim: fimDoDia } = limitesDoDiaEmLisboa(cursor);

    if (diasComAula.has(diaDaSemanaEmLisboa(cursor))) {
      const entradaDoDia = registosDoAluno.find(
        (registo) =>
          registo.tipo === "entrada" &&
          registo.estado === "autorizado" &&
          registo.dataHora >= inicioDoDia &&
          registo.dataHora < fimDoDia,
      );

      const situacao: SituacaoDia = !entradaDoDia
        ? "falta"
        : entradaDoDia.horarioId
          ? "presenca_atraso"
          : "presenca";

      dias.push({ data: inicioDoDia, situacao, horaEntrada: entradaDoDia?.dataHora });
    }

    cursor = fimDoDia;
  }

  const diasLetivos = dias.length;
  const atrasos = dias.filter((d) => d.situacao === "presenca_atraso").length;
  const faltas = dias.filter((d) => d.situacao === "falta").length;
  const presencas = diasLetivos - faltas;
  const taxaPresenca = diasLetivos === 0 ? 0 : presencas / diasLetivos;

  return { diasLetivos, presencas, atrasos, faltas, taxaPresenca, dias };
}
