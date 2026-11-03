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
