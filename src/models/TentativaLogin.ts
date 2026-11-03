import mongoose, { Schema, type Model, type Types } from "mongoose";

export const MAX_TENTATIVAS = 5;
export const JANELA_MINUTOS = 15;

export interface ITentativaLogin {
  _id: Types.ObjectId;
  email: string;
  ip?: string;
  quando: Date;
}

const TentativaLoginSchema = new Schema<ITentativaLogin>({
  email: { type: String, required: true, lowercase: true, trim: true },
  ip: { type: String },
  quando: { type: Date, required: true, default: Date.now },
});

TentativaLoginSchema.index({ email: 1, quando: -1 });

TentativaLoginSchema.index({ quando: 1 }, { expireAfterSeconds: JANELA_MINUTOS * 60 });

export const TentativaLogin: Model<ITentativaLogin> =
  (mongoose.models.TentativaLogin as Model<ITentativaLogin>) ||
  mongoose.model<ITentativaLogin>("TentativaLogin", TentativaLoginSchema, "tentativasLogin");
