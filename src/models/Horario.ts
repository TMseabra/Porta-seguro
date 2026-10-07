/** Modelo: horarios. Bloco de aula (dia + início + fim): serve para decidir saídas e atrasos. */

import mongoose, { Schema, type Model, type Types } from "mongoose";

const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface IHorario {
  _id: Types.ObjectId;
  turmaId: Types.ObjectId;
  /** 0 = domingo ... 6 = sábado (como o JavaScript). */
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  disciplina: string;
  professorId?: Types.ObjectId;
  sala?: string;
}

const HorarioSchema = new Schema<IHorario>(
  {
    turmaId: { type: Schema.Types.ObjectId, ref: "Turma", required: true },

    diaSemana: { type: Number, required: true, min: 0, max: 6 },

    horaInicio: {
      type: String,
      required: true,
      match: [REGEX_HORA, 'A hora de início tem de estar no formato "HH:MM".'],
    },

    horaFim: {
      type: String,
      required: true,
      match: [REGEX_HORA, 'A hora de fim tem de estar no formato "HH:MM".'],
    },

    disciplina: { type: String, required: true, trim: true },

    professorId: { type: Schema.Types.ObjectId, ref: "Utilizador" },

    sala: { type: String, trim: true },
  },
  { timestamps: true },
);

// Hook e não `validate` no campo: só aqui se acede ao documento inteiro. Com zeros à esquerda, a ordem
// alfabética de "HH:MM" é a cronológica.
HorarioSchema.pre("validate", function () {
  if (this.horaFim <= this.horaInicio) {
    throw new Error("A hora de fim tem de ser depois da hora de início.");
  }
});

// Consulta mais frequente: blocos de uma turma num dia.
HorarioSchema.index({ turmaId: 1, diaSemana: 1 });

export const Horario: Model<IHorario> =
  (mongoose.models.Horario as Model<IHorario>) ||
  mongoose.model<IHorario>("Horario", HorarioSchema, "horarios");
