/**
 * Modelo: utilizadores. Todas as pessoas do sistema, distinguidas por `perfil`. Alguns campos só fazem
 * sentido para certos perfis (ex.: numeroAluno), mas ficam no mesmo modelo: é a mesma pessoa que faz login.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";
import { PERFIS, type Perfil } from "@/lib/constantes";

export interface IUtilizador {
  _id: Types.ObjectId;
  nomeCompleto: string;
  email: string;
  /** Hash Argon2id. Ausente se só usar login Google. */
  palavraPasse?: string;
  perfil: Perfil;
  telemovel?: string;
  numeroAluno?: number;
  numeroCartao?: string;
  turmaId?: Types.ObjectId;
  maiorIdade: boolean;
  /** Só alunos: os pais autorizaram a saída fora do horário. */
  autorizacaoPais: boolean;
  /** Só alunos: impede a entrada. */
  suspenso: boolean;
  /** Mostrada na portaria para confirmar a identidade. */
  fotoUrl?: string;
  /** Espelho preenchido só pelo seed; a fonte é Turma.diretorTurmaId (ver ambito.ts). */
  turmasQueCoordena: Types.ObjectId[];
  /** Espelho preenchido só pelo seed; a fonte é Curso.coordenadorId (ver ambito.ts). */
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

    // select: false: o hash nunca vem numa consulta normal, só com `.select("+palavraPasse")` na
    // autenticação. Evita enviá-lo para o browser por engano.
    palavraPasse: { type: String, select: false },

    perfil: { type: String, enum: PERFIS, required: true, default: "aluno" },

    telemovel: { type: String, trim: true },

    numeroAluno: { type: Number },

    // unique + sparse: não há dois cartões iguais, mas quem não tem cartão (porteiro, admin...) não
    // conta como duplicado de null.
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

// Consulta frequente: os alunos de uma turma.
UtilizadorSchema.index({ turmaId: 1 });

export const Utilizador: Model<IUtilizador> =
  (mongoose.models.Utilizador as Model<IUtilizador>) ||
  mongoose.model<IUtilizador>("Utilizador", UtilizadorSchema, "utilizadores");
