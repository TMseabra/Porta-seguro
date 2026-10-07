/**
 * Que turmas cada perfil pode consultar. Verifica-se no servidor (horários e assiduidade): filtrar só
 * o menu não impede ninguém de enviar à mão o id de outra turma.
 */

import type { Types } from "mongoose";
import { ligarBaseDados } from "@/lib/mongoose";
import { Turma, Horario, Curso } from "@/models";
import type { Perfil } from "@/lib/constantes";

export interface TurmaDoAmbito {
  id: string;
  nome: string;
  ano: number;
}

/**
 * Turmas visíveis: admin/gestor -> todas; coordenador -> as dos cursos que coordena; professor/dt ->
 * onde têm aulas e as que dirigem; outros perfis -> nenhuma. Consulta-se sempre a fonte
 * (Curso.coordenadorId, Turma.diretorTurmaId) e não os campos-espelho de Utilizador, que só o seed
 * preenche: usá-los escondia os coordenadores/DTs atribuídos depois do seed.
 */
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

    // Set: um professor tem vários blocos na mesma turma.
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
