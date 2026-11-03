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
  tipo: TipoRegisto;
  momentoSimulado?: Date;
  tipoEscolhido?: boolean;
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

TokenQRSchema.index({ alunoId: 1, usado: 1 });

export const TokenQR: Model<ITokenQR> =
  (mongoose.models.TokenQR as Model<ITokenQR>) ||
  mongoose.model<ITokenQR>("TokenQR", TokenQRSchema, "tokensQR");
