import type { Types } from "mongoose";
import type { IHorario } from "@/models/Horario";
import { encontrarBlocoADecorrer } from "./horarios";

export interface AlunoParaDecisaoSaida {
  maiorIdade: boolean;
  autorizacaoPais: boolean;
}

export interface DecisaoSaida {
  autorizado: boolean;
  motivo: string;
  horarioId?: Types.ObjectId;
}

/** Autorizada se não há aula a decorrer, ou é maior de idade, ou tem autorização dos pais. */
export function decidirSaida(
  aluno: AlunoParaDecisaoSaida,
  horariosDaTurma: IHorario[],
  momento: Date,
): DecisaoSaida {
  const bloco = encontrarBlocoADecorrer(horariosDaTurma, momento);

  if (!bloco) {
    return { autorizado: true, motivo: "Fora do horário letivo." };
  }

  if (aluno.maiorIdade) {
    return {
      autorizado: true,
      motivo: "Aluno maior de idade.",
      horarioId: bloco._id,
    };
  }

  if (aluno.autorizacaoPais) {
    return {
      autorizado: true,
      motivo: "Aluno tem autorização dos pais para sair fora do horário letivo.",
      horarioId: bloco._id,
    };
  }

  return {
    autorizado: false,
    motivo: "Dentro do horário letivo e sem autorização dos pais para sair.",
    horarioId: bloco._id,
  };
}
