import type { Types } from "mongoose";
import type { TipoRegisto } from "@/lib/constantes";

export interface DadosTokenQR {
  alunoId: Types.ObjectId | string;
  validoAte: Date;
  usado: boolean;
  tipo: TipoRegisto;
}

export type MotivoTokenInvalido =
  | "aluno_diferente"
  | "ja_utilizado"
  | "expirado"
  | "tipo_incorreto";

export type ResultadoValidacaoQR =
  | { valido: true }
  | { valido: false; motivo: MotivoTokenInvalido };

/** Ordem: identidade, reutilização, expiração, direção. Expira em validoAte (>=). */
export function validarTokenQR(
  tokenQR: DadosTokenQR,
  alunoIdQueApresenta: Types.ObjectId | string,
  tipoEsperado: TipoRegisto,
  momento: Date,
): ResultadoValidacaoQR {
  if (String(tokenQR.alunoId) !== String(alunoIdQueApresenta)) {
    return { valido: false, motivo: "aluno_diferente" };
  }

  if (tokenQR.usado) {
    return { valido: false, motivo: "ja_utilizado" };
  }

  if (momento >= tokenQR.validoAte) {
    return { valido: false, motivo: "expirado" };
  }

  if (tokenQR.tipo !== tipoEsperado) {
    return { valido: false, motivo: "tipo_incorreto" };
  }

  return { valido: true };
}
