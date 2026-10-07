import type { IHorario } from "@/models/Horario";
import {
  diaDaSemanaEmLisboa,
  minutosDoDiaEmLisboa,
  horaParaMinutos,
} from "@/lib/datas";

/** "A decorrer" vai do início (inclusive) ao fim (exclusive): no minuto da troca, só um dos blocos seguidos conta. */
export function encontrarBlocoADecorrer(
  horariosDaTurma: IHorario[],
  momento: Date,
): IHorario | undefined {
  const diaSemana = diaDaSemanaEmLisboa(momento);
  const minutoAtual = minutosDoDiaEmLisboa(momento);

  return horariosDaTurma.find((bloco) => {
    if (bloco.diaSemana !== diaSemana) return false;

    const inicio = horaParaMinutos(bloco.horaInicio);
    const fim = horaParaMinutos(bloco.horaFim);
    return minutoAtual >= inicio && minutoAtual < fim;
  });
}
