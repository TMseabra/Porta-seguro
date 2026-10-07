/** Modelo: cursos. Agrupa turmas e tem um coordenador. */

import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ICurso {
  _id: Types.ObjectId;
  nome: string;
  sigla: string;
  anosDuracao: number;
  coordenadorId?: Types.ObjectId;
}

const CursoSchema = new Schema<ICurso>(
  {
    nome: { type: String, required: true, trim: true },

    // Sempre em maiúsculas, para não haver "api" e "API".
    sigla: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    anosDuracao: { type: Number, required: true, min: 1 },

    coordenadorId: { type: Schema.Types.ObjectId, ref: "Utilizador" },
  },
  { timestamps: true },
);

// Evita "Cannot overwrite model once compiled" quando o Next.js recarrega módulos em desenvolvimento.
export const Curso: Model<ICurso> =
  (mongoose.models.Curso as Model<ICurso>) ||
  // Nome da coleção explícito: o plural automático do Mongoose é inglês ("cursoss").
  mongoose.model<ICurso>("Curso", CursoSchema, "cursos");
