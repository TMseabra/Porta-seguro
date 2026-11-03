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

export function calcularAssiduidade(
  horariosDaTurma: Array<{ diaSemana: number }>,
  registosDoAluno: RegistoParaAssiduidade[],
  periodo: { inicio: Date; fim: Date },
): ResultadoAssiduidade {
  const diasComAula = new Set(horariosDaTurma.map((h) => h.diaSemana));
  const dias: DiaAssiduidade[] = [];

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
