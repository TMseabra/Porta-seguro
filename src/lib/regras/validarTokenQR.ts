/**
 * Validação de código QR dinâmico (RF15/RF16). O token é procurado na BD antes de chamar isto; se não
 * existir é "código desconhecido" e quem chama trata-o (nem há aluno a quem associar a tentativa).
 */

import type { Types } from "mongoose";
import type { TipoRegisto } from "@/lib/constantes";

export interface DadosTokenQR {
  alunoId: Types.ObjectId | string;
  validoAte: Date;
  usado: boolean;
  /** Direção com que o código foi gerado (RF15): um código de entrada nunca serve para sair. */
  tipo: TipoRegisto;
}

/** Coincidem com o final de TIPOS_OCORRENCIA ("qr_" + motivo), para construir a ocorrência sem tabela de conversão. */
export type MotivoTokenInvalido =
  | "aluno_diferente"
  | "ja_utilizado"
  | "expirado"
  | "tipo_incorreto";

export type ResultadoValidacaoQR =
  | { valido: true }
  | { valido: false; motivo: MotivoTokenInvalido };

/**
 * Ordem: identidade primeiro (um QR de outro aluno é o mais grave), depois reutilização, expiração e,
 * por fim, a direção (só faz sentido perguntar se o código em si ainda era bom).
 * Expira no instante exato de `validoAte` (>=).
 */
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
