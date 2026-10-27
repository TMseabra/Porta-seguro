import Link from "next/link";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Turma, Curso, Utilizador } from "@/models";
import { removerTurma } from "./acoes";
import { BotaoConfirmar } from "../botao-confirmar";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaTurmas({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();
  const { erro } = await searchParams;

  const turmas = await Turma.find().sort({ nome: 1 }).lean();
  const cursos = await Curso.find({ _id: { $in: turmas.map((t) => t.cursoId) } })
    .select("nome sigla")
    .lean();
  const nomeCursoPorId = new Map(cursos.map((c) => [c._id.toString(), `${c.nome} (${c.sigla})`]));

  const contagemAlunos = await Utilizador.aggregate([
    { $match: { perfil: "aluno", turmaId: { $in: turmas.map((t) => t._id) } } },
    { $group: { _id: "$turmaId", total: { $sum: 1 } } },
  ]);
  const alunosPorTurma = new Map(
    contagemAlunos.map((linha: { _id: unknown; total: number }) => [String(linha._id), linha.total]),
  );

  return (
    <PaginaInterna
      titulo="Turmas"
      voltarHref="/admin"
      voltarLabel="Administração"
      acao={
        <Link
          href="/admin/turmas/novo"
          className="botao"
        >
          + Nova turma
        </Link>
      }>
      {erro && (
        <p className="aviso aviso-vermelho mb-4">
          {erro}
        </p>
      )}

      <div className="tabela-rolavel">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ano</th>
              <th>Curso</th>
              <th>Alunos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {turmas.map((turma) => (
              <tr key={turma._id.toString()}>
                <td>{turma.nome}</td>
                <td>{turma.ano}</td>
                <td>{nomeCursoPorId.get(turma.cursoId.toString()) ?? "—"}</td>
                <td>
                  {alunosPorTurma.get(turma._id.toString()) ?? 0}
                </td>
                <td>
                  <Link
                    href={`/admin/turmas/${turma._id}`}
                    className="underline"
                  >
                    Editar / horários
                  </Link>{" "}
                  <form action={removerTurma} className="inline">
                    <input type="hidden" name="id" value={turma._id.toString()} />
                    <BotaoConfirmar
                      mensagem={`Remover a turma "${turma.nome}"? Os horários dela também são removidos e os alunos ficam sem turma.`}
                      className="ml-2 underline"
                    >
                      Remover
                    </BotaoConfirmar>
                  </form>
                </td>
              </tr>
            ))}
            {turmas.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">
                  Ainda sem turmas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PaginaInterna>
  );
}
