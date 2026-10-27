import { BarraTopo } from "@/components/barra-topo";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { limitesDoDiaEmLisboa, formatarHora } from "@/lib/datas";
import { Registo, Utilizador } from "@/models";
import { PainelPortao } from "./painel-portao";
import type { LinhaRegisto } from "@/lib/movimento";

/** Portão Teste (UC01): QR, semáforo e registos do dia. Só porteiro e admin: cria registos verdadeiros. */
export default async function PaginaPortaoTeste() {
  await exigirPerfil(["porteiro", "admin"]);
  await ligarBaseDados();

  const { inicio, fim } = limitesDoDiaEmLisboa(new Date());
  const registosHoje = await Registo.find({ dataHora: { $gte: inicio, $lt: fim } })
    .sort({ dataHora: -1 })
    .lean();

  const alunoIds = [...new Set(registosHoje.map((registo) => registo.alunoId.toString()))];
  const alunos = await Utilizador.find({ _id: { $in: alunoIds } })
    .select("nomeCompleto")
    .lean();
  const nomesPorId = new Map(alunos.map((aluno) => [aluno._id.toString(), aluno.nomeCompleto]));

  const linhasIniciais: LinhaRegisto[] = registosHoje.map((registo) => ({
    id: registo._id.toString(),
    alunoNome: nomesPorId.get(registo.alunoId.toString()) ?? "Aluno desconhecido",
    tipo: registo.tipo,
    estado: registo.estado,
    metodo: registo.metodo,
    horaFormatada: formatarHora(registo.dataHora),
  }));

  return (
    <div className="flex min-h-full flex-col">
      <BarraTopo titulo="PortãoSeguro — Portão" voltar={{ href: "/painel", texto: "← Painel" }} comSair />

      <main className="pagina">
        <h1>Portaria</h1>
        <p className="subtitulo mb-4">
          Leitura do código QR, confirmação da identidade e registo do movimento.
        </p>
        <PainelPortao linhasIniciais={linhasIniciais} />
      </main>
    </div>
  );
}
