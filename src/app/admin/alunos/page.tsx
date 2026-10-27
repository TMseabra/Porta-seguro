import Link from "next/link";
import type { Types } from "mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Utilizador, Turma } from "@/models";
import { removerAluno } from "./acoes";
import { BotaoConfirmar } from "../botao-confirmar";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaAlunos({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();
  const { erro } = await searchParams;

  const alunos = await Utilizador.find({ perfil: "aluno" }).sort({ nomeCompleto: 1 }).lean();
  const idsTurmas = alunos
    .map((a) => a.turmaId)
    .filter((id): id is Types.ObjectId => Boolean(id));
  const turmas = await Turma.find({ _id: { $in: idsTurmas } })
    .select("nome")
    .lean();
  const nomeTurmaPorId = new Map(turmas.map((t) => [t._id.toString(), t.nome]));

  return (
    <PaginaInterna
      titulo="Alunos"
      voltarHref="/admin"
      voltarLabel="Administração"
      acao={
        <Link
          href="/admin/alunos/novo"
          className="botao"
        >
          + Novo aluno
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
              <th>Turma</th>
              <th>Cartão</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno._id.toString()}>
                <td>{aluno.nomeCompleto}</td>
                <td>
                  {aluno.turmaId ? (nomeTurmaPorId.get(aluno.turmaId.toString()) ?? "—") : "—"}
                </td>
                <td>{aluno.numeroCartao ?? "—"}</td>
                <td>
                  {aluno.suspenso ? (
                    <b>Suspenso</b>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <Link
                    href={`/admin/alunos/${aluno._id}`}
                    className="underline"
                  >
                    Editar
                  </Link>{" "}
                  <form action={removerAluno} className="inline">
                    <input type="hidden" name="id" value={aluno._id.toString()} />
                    <BotaoConfirmar
                      mensagem={`Remover o aluno "${aluno.nomeCompleto}"? O histórico de registos e ocorrências dele também é apagado.`}
                      className="ml-2 underline"
                    >
                      Remover
                    </BotaoConfirmar>
                  </form>
                </td>
              </tr>
            ))}
            {alunos.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">
                  Ainda sem alunos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PaginaInterna>
  );
}
