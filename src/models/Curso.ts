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

export const Curso: Model<ICurso> =
  (mongoose.models.Curso as Model<ICurso>) ||
  // Nome da coleção explícito: o plural automático do Mongoose é inglês.
  mongoose.model<ICurso>("Curso", CursoSchema, "cursos");
