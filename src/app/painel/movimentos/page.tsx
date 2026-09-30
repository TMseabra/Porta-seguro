import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Registo } from "@/models";
import { chaveDoDiaEmLisboa, formatarData, formatarHora, NOMES_DIAS_SEMANA, diaDaSemanaEmLisboa } from "@/lib/datas";
import type { EstadoRegisto } from "@/lib/constantes";
import { ShellPainel, TituloPagina, Cartao } from "../shell";

/** Quantos movimentos mostrar — chega para ver as últimas semanas sem
 * carregar o histórico inteiro de um ano letivo de uma vez. */
const LIMITE = 100;

const ESTADOS: Record<EstadoRegisto, { rotulo: string; classe: string }> = {
  autorizado: { rotulo: "Autorizado", classe: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" },
  confirmado_pais: { rotulo: "Autorizado (pais)", classe: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" },
  nao_autorizado: { rotulo: "Não autorizado", classe: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300" },
};

export default async function PaginaMovimentos() {
  const sessao = await exigirPerfil(["aluno"]);
  await ligarBaseDados();

  // Só os movimentos reais — os da ferramenta de simulação do admin são
  // demonstrações, não passagens verdadeiras pela portaria.
  const registos = await Registo.find({ alunoId: sessao.user.id, metodo: { $ne: "simulacao" } })
    .select("tipo estado dataHora motivo")
    .sort({ dataHora: -1 })
    .limit(LIMITE)
    .lean();

  const porDia = new Map<string, typeof registos>();
  for (const registo of registos) {
    const chave = chaveDoDiaEmLisboa(registo.dataHora);
    porDia.set(chave, [...(porDia.get(chave) ?? []), registo]);
  }

  const entradas = registos.filter((r) => r.tipo === "entrada").length;
  const saidas = registos.length - entradas;

  return (
    <ShellPainel sessao={sessao} ativo="movimentos" titulo="Movimentos">
      <TituloPagina
        titulo="Movimentos"
        descricao="Todas as tuas entradas e saídas registadas na portaria."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Resumo titulo="Registos" valor={registos.length} />
        <Resumo titulo="Entradas" valor={entradas} />
        <Resumo titulo="Saídas" valor={saidas} />
      </div>

      {registos.length === 0 ? (
        <Cartao>
          <p className="py-10 text-center text-sm text-slate-500">
            Ainda não há movimentos registados. Aparecem aqui assim que passares pela portaria.
          </p>
        </Cartao>
      ) : (
        <div className="flex flex-col gap-4">
          {[...porDia.entries()].map(([chave, doDia]) => (
            <Cartao key={chave}>
              <h2 className="mb-3 text-sm font-semibold">
                {NOMES_DIAS_SEMANA[diaDaSemanaEmLisboa(doDia[0].dataHora)]}, {formatarData(doDia[0].dataHora)}
              </h2>
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {doDia.map((m) => {
                  const estado = ESTADOS[m.estado];
                  return (
                    <li key={m._id.toString()} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                      <span className="w-12 font-mono tabular-nums text-slate-500">{formatarHora(m.dataHora)}</span>
                      <span className="w-16 font-medium">{m.tipo === "entrada" ? "Entrada" : "Saída"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estado.classe}`}>{estado.rotulo}</span>
                      {m.motivo && <span className="basis-full text-xs text-slate-500 sm:basis-auto sm:flex-1">{m.motivo}</span>}
                    </li>
                  );
                })}
              </ul>
            </Cartao>
          ))}
          {registos.length === LIMITE && (
            <p className="text-center text-xs text-slate-500">A mostrar os últimos {LIMITE} movimentos.</p>
          )}
        </div>
      )}
    </ShellPainel>
  );
}

function Resumo({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <Cartao>
      <p className="text-2xl font-bold tabular-nums">{valor}</p>
      <p className="text-xs text-slate-500">{titulo}</p>
    </Cartao>
  );
}
