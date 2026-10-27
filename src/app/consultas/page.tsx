import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { partesEmLisboa } from "@/lib/datas";
import { Utilizador } from "@/models";
import { turmasDoUtilizador } from "@/lib/ambito";
import { FiltroConsulta } from "./filtro-consulta";
import { BarraTopo } from "@/components/barra-topo";

/** Consultas (UC02/UC04): assiduidade por aluno, turma ou ano, com PDF. Só admin e coordenador. */
export default async function PaginaConsultas() {
  const sessao = await exigirPerfil(["coordenador", "gestor", "admin"]);
  await ligarBaseDados();

  const turmas = await turmasDoUtilizador(sessao.user.id, sessao.user.perfil);

  const alunos = await Utilizador.find({
    perfil: "aluno",
    turmaId: { $in: turmas.map((turma) => turma.id) },
  })
    .select("nomeCompleto numeroAluno")
    .sort({ nomeCompleto: 1 })
    .lean();

  const anos = [...new Set(turmas.map((turma) => turma.ano))].sort((a, b) => a - b);
  const { ano, mes } = partesEmLisboa(new Date());
  const mesAtual = `${ano}-${String(mes).padStart(2, "0")}`;

  return (
    <div className="flex min-h-full flex-col">
      <BarraTopo titulo="PortãoSeguro — Consultas" voltar={{ href: "/painel", texto: "← Painel" }} comSair />

      <main className="pagina">
        <h1>Consultas de assiduidade</h1>
        <p className="subtitulo mb-4">Presenças, atrasos e faltas por aluno, turma ou ano de formação.</p>

        {turmas.length === 0 ? (
          <p className="subtitulo">Ainda não tens turmas atribuídas para consultar.</p>
        ) : (
          <FiltroConsulta
            alunos={alunos.map((a) => ({ id: a._id.toString(), nome: a.nomeCompleto }))}
            turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))}
            anos={anos}
            mesInicial={mesAtual}
            podeExportar
          />
        )}
      </main>
    </div>
  );
}
