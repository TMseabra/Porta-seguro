import Link from "next/link";
import type { Types } from "mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Curso, Turma, Utilizador } from "@/models";
import { removerCurso } from "./acoes";
import { BotaoConfirmar } from "../botao-confirmar";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaCursos({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();
  const { erro } = await searchParams;

  const cursos = await Curso.find().sort({ nome: 1 }).lean();

  const idsCoordenadores = cursos
    .map((c) => c.coordenadorId)
    .filter((id): id is Types.ObjectId => Boolean(id));
  const coordenadores = await Utilizador.find({ _id: { $in: idsCoordenadores } })
    .select("nomeCompleto")
    .lean();
  const nomeCoordenadorPorId = new Map(
    coordenadores.map((c) => [c._id.toString(), c.nomeCompleto]),
  );

  const turmas = await Turma.find({ cursoId: { $in: cursos.map((c) => c._id) } })
    .select("cursoId")
    .lean();
  const turmasPorCurso = new Map<string, number>();
  for (const turma of turmas) {
    const chave = turma.cursoId.toString();
    turmasPorCurso.set(chave, (turmasPorCurso.get(chave) ?? 0) + 1);
  }

  return (
    <PaginaInterna
      titulo="Cursos"
      voltarHref="/admin"
      voltarLabel="Administração"
      acao={
        <Link
          href="/admin/cursos/novo"
          className="botao"
        >
          + Novo curso
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
              <th>Sigla</th>
              <th>Anos</th>
              <th>Coordenador</th>
              <th>Turmas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((curso) => (
              <tr key={curso._id.toString()}>
                <td>{curso.nome}</td>
                <td>{curso.sigla}</td>
                <td>{curso.anosDuracao}</td>
                <td>
                  {curso.coordenadorId
                    ? (nomeCoordenadorPorId.get(curso.coordenadorId.toString()) ?? "—")
                    : "—"}
                </td>
                <td>
                  {turmasPorCurso.get(curso._id.toString()) ?? 0}
                </td>
                <td>
                  <Link
                    href={`/admin/cursos/${curso._id}`}
                    className="underline"
                  >
                    Editar
                  </Link>{" "}
                  <form action={removerCurso} className="inline">
                    <input type="hidden" name="id" value={curso._id.toString()} />
                    <BotaoConfirmar
                      mensagem={`Remover o curso "${curso.nome}"?`}
                      className="ml-2 underline"
                    >
                      Remover
                    </BotaoConfirmar>
                  </form>
                </td>
              </tr>
            ))}
            {cursos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  Ainda sem cursos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PaginaInterna>
  );
}
