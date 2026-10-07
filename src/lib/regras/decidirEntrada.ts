import type { Types } from "mongoose";
import type { IHorario } from "@/models/Horario";
import { encontrarBlocoADecorrer } from "./horarios";

export interface AlunoParaDecisaoEntrada {
  suspenso: boolean;
}

export interface DecisaoEntrada {
  autorizado: boolean;
  motivo: string;
  comAtraso: boolean;
  horarioId?: Types.ObjectId;
  criarOcorrencia: boolean;
}

/** Suspenso nunca entra (fica ocorrência). Senão autoriza; é atraso se já decorre uma aula da turma. */
export function decidirEntrada(
  aluno: AlunoParaDecisaoEntrada,
  horariosDaTurma: IHorario[],
  momento: Date,
): DecisaoEntrada {
  if (aluno.suspenso) {
    return {
      autorizado: false,
      motivo: "Aluno suspenso.",
      comAtraso: false,
      criarOcorrencia: true,
    };
  }

  const bloco = encontrarBlocoADecorrer(horariosDaTurma, momento);

  if (!bloco) {
    return {
      autorizado: true,
      motivo: "Entrada dentro de horário.",
      comAtraso: false,
      criarOcorrencia: false,
    };
  }

  return {
    autorizado: true,
    motivo: "Entrada com atraso: já decorre uma aula da turma.",
    comAtraso: true,
    horarioId: bloco._id,
    criarOcorrencia: false,
  };
}
