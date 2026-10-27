import { PaginaInterna } from "@/components/pagina-interna";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { turmasDoUtilizador } from "@/lib/ambito";
import { Horario, Utilizador } from "@/models";
import type { TurmaComHorario } from "./seletor-turma";
import { VistaHorario, type ProfessorComHorario } from "./vista-horario";
import type { BlocoHorario } from "@/components/horario-semanal";

/**
 * Horários das turmas: professor/diretor de turma vê as suas; coordenador as dos seus cursos; admin a
 * escola toda. Sem assiduidade (isso é /consultas).
 */
export default async function PaginaHorarios({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const sessao = await exigirPerfil(["professor", "dt", "coordenador", "gestor", "admin"]);
  await ligarBaseDados();
  const { vista } = await searchParams;
  const vistaInicial = vista === "pessoal" ? "pessoal" : vista === "turma" ? "turma" : undefined;

  const turmas = await turmasDoUtilizador(sessao.user.id, sessao.user.perfil);

  const blocos = await Horario.find({ turmaId: { $in: turmas.map((t) => t.id) } })
    .sort({ diaSemana: 1, horaInicio: 1 })
    .lean();

  // O type guard é preciso porque `.filter(Boolean)` não estreita o tipo para o TypeScript.
  const idsProfessores = [
    ...new Set(
      blocos
        .map((b) => b.professorId?.toString())
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const professores = await Utilizador.find({ _id: { $in: idsProfessores } })
    .select("nomeCompleto")
    .lean();
  const nomePorId = new Map(professores.map((p) => [p._id.toString(), p.nomeCompleto]));
  const nomeTurmaPorId = new Map(turmas.map((t) => [t.id, t.nome]));

  // Os mesmos blocos agrupados por turma e por professor (ver VistaHorario).
  const blocosPorTurma = new Map<string, BlocoHorario[]>();
  const blocosPorProfessor = new Map<string, BlocoHorario[]>();
  for (const bloco of blocos) {
    const chaveTurma = bloco.turmaId.toString();
    const blocoPronto: BlocoHorario = {
      diaSemana: bloco.diaSemana,
      horaInicio: bloco.horaInicio,
      horaFim: bloco.horaFim,
      disciplina: bloco.disciplina,
      sala: bloco.sala,
      professor: bloco.professorId ? nomePorId.get(bloco.professorId.toString()) : undefined,
      turma: nomeTurmaPorId.get(chaveTurma),
    };

    const listaTurma = blocosPorTurma.get(chaveTurma) ?? [];
    listaTurma.push(blocoPronto);
    blocosPorTurma.set(chaveTurma, listaTurma);

    if (bloco.professorId) {
      const chaveProfessor = bloco.professorId.toString();
      const listaProfessor = blocosPorProfessor.get(chaveProfessor) ?? [];
      listaProfessor.push(blocoPronto);
      blocosPorProfessor.set(chaveProfessor, listaProfessor);
    }
  }

  // Feito no servidor para o cliente não ir à rede ao trocar de turma.
  const turmasComHorario: TurmaComHorario[] = turmas.map((turma) => ({
    id: turma.id,
    nome: turma.nome,
    ano: turma.ano,
    blocos: blocosPorTurma.get(turma.id) ?? [],
  }));

  const meuHorario =
    sessao.user.perfil === "professor" ? (blocosPorProfessor.get(sessao.user.id) ?? []) : undefined;
  const professoresComHorario: ProfessorComHorario[] | undefined =
    sessao.user.perfil === "admin" || sessao.user.perfil === "gestor"
      ? idsProfessores
          .map((id) => ({ id, nome: nomePorId.get(id) ?? "—", blocos: blocosPorProfessor.get(id) ?? [] }))
          .sort((a, b) => a.nome.localeCompare(b.nome, "pt-PT"))
      : undefined;

  return (
    <PaginaInterna
      titulo="Horário de turmas"
      subtitulo={`${turmas.length} ${turmas.length === 1 ? "turma atribuída" : "turmas atribuídas"}`}
      voltarHref="/painel"
      voltarLabel="Painel"
    >
      {turmas.length === 0 ? (
        <p className="subtitulo">
          Ainda não tens turmas atribuídas. Fala com a administração para te associarem blocos de horário ou um
          curso a coordenar.
        </p>
      ) : (
        <VistaHorario
          turmas={turmasComHorario}
          meuHorario={meuHorario}
          professores={professoresComHorario}
          vistaInicial={vistaInicial}
        />
      )}
    </PaginaInterna>
  );
}
