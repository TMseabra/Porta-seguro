/**
 * Modelo: codigosVerificacao. Código de 6 dígitos enviado por email às contas admin/gestor (2.º fator,
 * decisão do aluno): são as que podem mudar passwords e ver todos os dados. Guarda-se o hash Argon2id,
 * nunca o código. Só 6 dígitos: o que trava ataques é expirar em 10 min, uso único e 3 tentativas.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";

export const VALIDADE_CODIGO_MINUTOS = 10;
export const MAX_TENTATIVAS_CODIGO = 3;

export interface ICodigoVerificacao {
  _id: Types.ObjectId;
  email: string;
  hash: string;
  tentativas: number;
  criadoEm: Date;
}

const CodigoVerificacaoSchema = new Schema<ICodigoVerificacao>({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  hash: { type: String, required: true },
  tentativas: { type: Number, required: true, default: 0 },
  criadoEm: { type: Date, required: true, default: Date.now },
});

// O MongoDB apaga os códigos expirados.
CodigoVerificacaoSchema.index(
  { criadoEm: 1 },
  { expireAfterSeconds: VALIDADE_CODIGO_MINUTOS * 60 },
);

export const CodigoVerificacao: Model<ICodigoVerificacao> =
  (mongoose.models.CodigoVerificacao as Model<ICodigoVerificacao>) ||
  mongoose.model<ICodigoVerificacao>(
    "CodigoVerificacao",
    CodigoVerificacaoSchema,
    "codigosVerificacao",
  );
