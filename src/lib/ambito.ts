import type { Types } from "mongoose";
import { ligarBaseDados } from "@/lib/mongoose";
import { Turma, Horario, Curso } from "@/models";
import type { Perfil } from "@/lib/constantes";

export interface TurmaDoAmbito {
  id: string;
  nome: string;
  ano: number;
}

export async function turmasDoUtilizador(
  idUtilizador: string,
  perfil: Perfil,
): Promise<TurmaDoAmbito[]> {
  await ligarBaseDados();

  if (perfil === "admin" || perfil === "gestor") {
    const todas = await Turma.find().select("nome ano").sort({ nome: 1 }).lean();
    return todas.map(paraTurmaDoAmbito);
  }

  if (perfil === "coordenador") {
    const cursos = await Curso.find({ coordenadorId: idUtilizador }).select("_id").lean();
    if (cursos.length === 0) return [];

    const turmas = await Turma.find({ cursoId: { $in: cursos.map((c) => c._id) } })
      .select("nome ano")
      .sort({ nome: 1 })
      .lean();
    return turmas.map(paraTurmaDoAmbito);
  }

  if (perfil === "professor" || perfil === "dt") {
    const [blocos, turmasDirigidas] = await Promise.all([
      Horario.find({ professorId: idUtilizador }).select("turmaId").lean(),
      Turma.find({ diretorTurmaId: idUtilizador }).select("_id").lean(),
    ]);

    const ids = new Set<string>(blocos.map((bloco) => bloco.turmaId.toString()));
    for (const turma of turmasDirigidas) {
      ids.add(turma._id.toString());
    }
    if (ids.size === 0) return [];

    const turmas = await Turma.find({ _id: { $in: [...ids] } })
      .select("nome ano")
      .sort({ nome: 1 })
      .lean();
    return turmas.map(paraTurmaDoAmbito);
  }

  return [];
}

function paraTurmaDoAmbito(turma: { _id: Types.ObjectId; nome: string; ano: number }): TurmaDoAmbito {
  return { id: turma._id.toString(), nome: turma.nome, ano: turma.ano };
}
