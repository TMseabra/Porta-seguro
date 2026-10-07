/**
 * Modelo: tentativasLogin. Regista logins FALHADOS para limitar tentativas por conta (RNF05, decisão do
 * aluno). O limite verifica-se ANTES do hash Argon2id, que gasta memória de propósito. As tentativas
 * apagam-se sozinhas (índice TTL).
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";

export const MAX_TENTATIVAS = 5;
export const JANELA_MINUTOS = 15;

export interface ITentativaLogin {
  _id: Types.ObjectId;
  email: string;
  /** Só para perceber de onde partiu um ataque; o bloqueio é por conta, não por IP (senão bastava mudar de rede). */
  ip?: string;
  quando: Date;
}

const TentativaLoginSchema = new Schema<ITentativaLogin>({
  email: { type: String, required: true, lowercase: true, trim: true },
  ip: { type: String },
  quando: { type: Date, required: true, default: Date.now },
});

TentativaLoginSchema.index({ email: 1, quando: -1 });

// O MongoDB apaga cada tentativa ao fim da janela: é o que torna o bloqueio temporário.
TentativaLoginSchema.index({ quando: 1 }, { expireAfterSeconds: JANELA_MINUTOS * 60 });

export const TentativaLogin: Model<ITentativaLogin> =
  (mongoose.models.TentativaLogin as Model<ITentativaLogin>) ||
  mongoose.model<ITentativaLogin>("TentativaLogin", TentativaLoginSchema, "tentativasLogin");
