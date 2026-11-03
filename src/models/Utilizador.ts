import mongoose, { Schema, type Model, type Types } from "mongoose";
import { PERFIS, type Perfil } from "@/lib/constantes";

export interface IUtilizador {
  _id: Types.ObjectId;
  nomeCompleto: string;
  email: string;
  palavraPasse?: string;
  perfil: Perfil;
  telemovel?: string;
  numeroAluno?: number;
  numeroCartao?: string;
  turmaId?: Types.ObjectId;
  maiorIdade: boolean;
  autorizacaoPais: boolean;
  suspenso: boolean;
  fotoUrl?: string;
  turmasQueCoordena: Types.ObjectId[];
  cursosQueCoordena: Types.ObjectId[];
}

const UtilizadorSchema = new Schema<IUtilizador>(
  {
    nomeCompleto: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // select: false: o hash só vem com .select("+palavraPasse").
    palavraPasse: { type: String, select: false },

    perfil: { type: String, enum: PERFIS, required: true, default: "aluno" },

    telemovel: { type: String, trim: true },

    numeroAluno: { type: Number },

    numeroCartao: { type: String, unique: true, sparse: true, trim: true },

    turmaId: { type: Schema.Types.ObjectId, ref: "Turma" },

    maiorIdade: { type: Boolean, default: false },
    autorizacaoPais: { type: Boolean, default: false },
    suspenso: { type: Boolean, default: false },

    fotoUrl: { type: String, trim: true },

    turmasQueCoordena: [{ type: Schema.Types.ObjectId, ref: "Turma" }],
    cursosQueCoordena: [{ type: Schema.Types.ObjectId, ref: "Curso" }],
  },
  { timestamps: true },
);

UtilizadorSchema.index({ turmaId: 1 });

export const Utilizador: Model<IUtilizador> =
  (mongoose.models.Utilizador as Model<IUtilizador>) ||
  mongoose.model<IUtilizador>("Utilizador", UtilizadorSchema, "utilizadores");
