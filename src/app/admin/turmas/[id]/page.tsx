import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { NOMES_DIAS_SEMANA } from "@/lib/datas";
import { Turma, Curso, Utilizador, Horario } from "@/models";
import { FormularioTurma } from "../formulario-turma";
import { atualizarTurma } from "../acoes";
import { removerHorario } from "./horarios/acoes";
import { BotaoConfirmar } from "../../botao-confirmar";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaEditarTurma({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();
  const { id } = await params;
  const { erro } = await searchParams;

  const [turma, cursos, diretores, professores, horarios] = await Promise.all([
    Turma.findById(id).lean(),
    Curso.find().select("nome").sort({ nome: 1 }).lean(),
    Utilizador.find({ perfil: "dt" }).select("nomeCompleto").sort({ nomeCompleto: 1 }).lean(),
    Utilizador.find({ perfil: { $in: ["professor", "dt"] } }).select("nomeCompleto").lean(),
    Horario.find({ turmaId: id }).sort({ diaSemana: 1, horaInicio: 1 }).lean(),
  ]);

  if (!turma) notFound();

  const nomeProfessorPorId = new Map(professores.map((p) => [p._id.toString(), p.nomeCompleto]));

  return (
    <PaginaInterna
      titulo={`Editar turma — ${turma.nome}`}
      voltarHref="/admin/turmas"
      voltarLabel="Turmas">
      <div className="cartao">
        <FormularioTurma
          acao={atualizarTurma}
          cursos={cursos.map((c) => ({ id: c._id.toString(), nome: c.nome }))}
          diretores={diretores.map((d) => ({ id: d._id.toString(), nome: d.nomeCompleto }))}
          turmaInicial={{
            id: turma._id.toString(),
            nome: turma.nome,
            ano: turma.ano,
            cursoId: turma.cursoId.toString(),
            diretorTurmaId: turma.diretorTurmaId?.toString(),
          }}
        />
      </div>

      <section className="cartao">
        {erro && (
          <p className="aviso aviso-vermelho mb-4">
            {erro}
          </p>
        )}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2>Horário semanal (RF10)</h2>
          <div className="flex gap-2">
            <Link
              href={`/admin/turmas/${id}/horarios/importar`}
              className="botao-claro"
            >
              Importar Excel
            </Link>
            <Link
              href={`/admin/turmas/${id}/horarios/novo`}
              className="botao"
            >
              + Novo bloco
            </Link>
          </div>
        </div>

        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Disciplina</th>
                <th>Professor(a)</th>
                <th>Sala</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario) => (
                <tr key={horario._id.toString()}>
                  <td>{NOMES_DIAS_SEMANA[horario.diaSemana]}</td>
                  <td>{horario.horaInicio}</td>
                  <td>{horario.horaFim}</td>
                  <td>{horario.disciplina}</td>
                  <td>
                    {horario.professorId
                      ? (nomeProfessorPorId.get(horario.professorId.toString()) ?? "—")
                      : "—"}
                  </td>
                  <td>{horario.sala ?? "—"}</td>
                  <td>
                    <Link
                      href={`/admin/turmas/${id}/horarios/${horario._id}`}
                      className="underline"
                    >
                      Editar
                    </Link>{" "}
                    <form action={removerHorario} className="inline">
                      <input type="hidden" name="id" value={horario._id.toString()} />
                      <input type="hidden" name="turmaId" value={id} />
                      <BotaoConfirmar
                        mensagem={`Remover o bloco de ${horario.disciplina} de ${NOMES_DIAS_SEMANA[horario.diaSemana]}?`}
                        className="ml-2 underline"
                      >
                        Remover
                      </BotaoConfirmar>
                    </form>
                  </td>
                </tr>
              ))}
              {horarios.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">
                    Ainda sem horário definido.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PaginaInterna>
  );
}
