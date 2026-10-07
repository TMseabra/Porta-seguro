/** Modelo: turmas. Pertence a um curso e tem um diretor de turma (perfil "dt"); os alunos apontam-lhe por `turmaId`. */

import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ITurma {
  _id: Types.ObjectId;
  nome: string;
  ano: number;
  cursoId: Types.ObjectId;
  diretorTurmaId?: Types.ObjectId;
}

const TurmaSchema = new Schema<ITurma>(
  {
    nome: { type: String, required: true, trim: true },

    ano: { type: Number, required: true, min: 1 },

    cursoId: { type: Schema.Types.ObjectId, ref: "Curso", required: true },

    diretorTurmaId: { type: Schema.Types.ObjectId, ref: "Utilizador" },
  },
  { timestamps: true },
);

// Para listar as turmas de um curso (relatórios).
TurmaSchema.index({ cursoId: 1 });

export const Turma: Model<ITurma> =
  (mongoose.models.Turma as Model<ITurma>) ||
  mongoose.model<ITurma>("Turma", TurmaSchema, "turmas");
