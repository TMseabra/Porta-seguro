/**
 * Modelo: tokensQR. Códigos QR dinâmicos (RF15): válidos 1 minuto, uso único, e só um válido por aluno
 * de cada vez (garantido no código ao gerar um novo, não pelo esquema).
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";
import { TIPOS_REGISTO, type TipoRegisto } from "@/lib/constantes";

export interface ITokenQR {
  _id: Types.ObjectId;
  alunoId: Types.ObjectId;
  token: string;
  criadoEm: Date;
  validoAte: Date;
  usado: boolean;
  usadoEm?: Date;
  /** Direção com que o código foi gerado. A leitura exige-a: um código de entrada nunca serve para sair. */
  tipo: TipoRegisto;
  /**
   * Só na conta de teste: a decisão entrada/saída usa esta data/hora em vez da real, para demonstrar a
   * qualquer hora. A validade do código (validoAte) continua real.
   */
  momentoSimulado?: Date;
  /** Só em simulações da conta de teste: a direção foi escolhida à mão (ver tipoDoCodigo.ts). */
  tipoEscolhido?: boolean;
  /**
   * Quando o código deu origem a um registo. `usado` marca a leitura; este marca a conclusão, para o
   * mesmo código não gerar dois movimentos.
   */
  movimentoRegistadoEm?: Date;
}

const TokenQRSchema = new Schema<ITokenQR>(
  {
    alunoId: { type: Schema.Types.ObjectId, ref: "Utilizador", required: true },

    token: { type: String, required: true, unique: true },

    criadoEm: { type: Date, required: true, default: Date.now },
    validoAte: { type: Date, required: true },

    usado: { type: Boolean, default: false },
    usadoEm: { type: Date },

    tipo: { type: String, enum: TIPOS_REGISTO, required: true },

    momentoSimulado: { type: Date },

    tipoEscolhido: { type: Boolean },

    movimentoRegistadoEm: { type: Date },
  },
  { timestamps: true },
);

// Índice para a procura "o token válido deste aluno" na portaria.
TokenQRSchema.index({ alunoId: 1, usado: 1 });

export const TokenQR: Model<ITokenQR> =
  (mongoose.models.TokenQR as Model<ITokenQR>) ||
  mongoose.model<ITokenQR>("TokenQR", TokenQRSchema, "tokensQR");
