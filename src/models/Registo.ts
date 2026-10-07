/**
 * Modelo: registos. Cada entrada/saída com a decisão tomada. Presenças, faltas e atrasos calculam-se daqui
 * (com `horarios`), nunca se introduzem à mão.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  TIPOS_REGISTO,
  METODOS_REGISTO,
  ESTADOS_REGISTO,
  type TipoRegisto,
  type MetodoRegisto,
  type EstadoRegisto,
} from "@/lib/constantes";

export interface IRegisto {
  _id: Types.ObjectId;
  alunoId: Types.ObjectId;
  dataHora: Date;
  tipo: TipoRegisto;
  metodo: MetodoRegisto;
  estado: EstadoRegisto;
  motivo?: string;
  horarioId?: Types.ObjectId;
  registadoPorId: Types.ObjectId;
  confirmacaoPais: boolean;
}

const RegistoSchema = new Schema<IRegisto>(
  {
    alunoId: { type: Schema.Types.ObjectId, ref: "Utilizador", required: true },

    dataHora: { type: Date, required: true, default: Date.now },

    tipo: { type: String, enum: TIPOS_REGISTO, required: true },
    metodo: { type: String, enum: METODOS_REGISTO, required: true },
    estado: { type: String, enum: ESTADOS_REGISTO, required: true },

    motivo: { type: String, trim: true },

    horarioId: { type: Schema.Types.ObjectId, ref: "Horario" },

    registadoPorId: {
      type: Schema.Types.ObjectId,
      ref: "Utilizador",
      required: true,
    },

    confirmacaoPais: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// O histórico de um aluno consulta-se sempre do mais recente para o mais antigo.
RegistoSchema.index({ alunoId: 1, dataHora: -1 });

export const Registo: Model<IRegisto> =
  (mongoose.models.Registo as Model<IRegisto>) ||
  mongoose.model<IRegisto>("Registo", RegistoSchema, "registos");
