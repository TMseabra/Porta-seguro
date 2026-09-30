import Link from "next/link";
import { GeradorQR } from "@/app/area-pessoal/gerador-qr";
import { ligarBaseDados } from "@/lib/mongoose";
import { calcularAssiduidade, type RegistoParaAssiduidade } from "@/lib/relatorios/calcularAssiduidade";
import { limitesDoDiaEmLisboa, limitesDoMesEmLisboa, partesEmLisboa, formatarHora } from "@/lib/datas";
import { Registo } from "@/models";
import { tokenInicialDoAluno, permissoesQR, horarioDoAluno } from "./dados-aluno";
import { Cartao } from "./shell";

/**
 * Página inicial do aluno: um RESUMO de cada secção. Cada cartão tem um
 * "Ver tudo" que abre a página própria dessa secção (/painel/qr,
 * /painel/horario, ...), onde está a versão completa.
 */
export async function DashboardAluno({ alunoId, email, nome }: { alunoId: string; email?: string | null; nome: string }) {
  await ligarBaseDados();
  const agora = new Date();
  const partes = partesEmLisboa(agora);
  const dia = limitesDoDiaEmLisboa(agora);
  const mes = limitesDoMesEmLisboa(partes.ano, partes.mes);

  const [{ turma, horarios }, tokenInicial, { podeGerar, podeEscolherHora }, registosMes, movimentos] = await Promise.all([
    horarioDoAluno(alunoId),
    tokenInicialDoAluno(alunoId),
    permissoesQR(email),
    Registo.find({ alunoId, dataHora: { $gte: mes.inicio, $lt: mes.fim }, metodo: { $ne: "simulacao" } }).select("tipo estado dataHora horarioId").lean(),
    Registo.find({ alunoId, dataHora: { $gte: dia.inicio, $lt: dia.fim }, metodo: { $ne: "simulacao" } }).select("tipo estado dataHora").sort({ dataHora: -1 }).limit(5).lean(),
  ]);

  const assiduidade = calcularAssiduidade(horarios, registosMes as RegistoParaAssiduidade[], mes);
  const percentagem = Math.round(assiduidade.taxaPresenca * 100);
  const horariosHoje = horarios.filter((h) => h.diaSemana === partes.diaSemana);
  const agoraHora = `${String(partes.horas).padStart(2, "0")}:${String(partes.minutos).padStart(2, "0")}`;
  const dataHoje = new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Lisbon" }).format(agora);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bem-vindo, {nome.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm capitalize text-slate-500 dark:text-slate-400">
          {dataHoje}
          {turma?.nome ? ` · Turma ${turma.nome}` : ""}
        </p>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Cartao>
          <CabecalhoCartao titulo="Código QR temporário" href="/painel/qr" />
          <GeradorQR tokenInicial={tokenInicial} podeGerar={podeGerar} podeEscolherHora={podeEscolherHora} compacto />
        </Cartao>

        <Cartao>
          <CabecalhoCartao titulo={`Assiduidade (${String(partes.mes).padStart(2, "0")}/${partes.ano})`} href="/painel/assiduidade" />
          <div className="flex items-center justify-center">
            <div
              aria-label={`Taxa de presença ${percentagem}%`}
              className="relative flex h-36 w-36 items-center justify-center rounded-full shadow-[0_0_28px_rgba(16,185,129,0.14)]"
              style={{ background: `conic-gradient(#10b981 ${percentagem}%, var(--attendance-empty) 0)` }}
            >
              <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white dark:bg-[#0c1118]">
                <span className="text-3xl font-bold">{percentagem}%</span>
                <span className="text-[10px] text-slate-500">presença</span>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <StatLinha tipo="presencas" titulo="Presenças" valor={assiduidade.presencas} />
            <StatLinha tipo="atrasos" titulo="Atrasos" valor={assiduidade.atrasos} />
            <StatLinha tipo="faltas" titulo="Faltas" valor={assiduidade.faltas} />
          </div>
        </Cartao>

        <Cartao>
          <CabecalhoCartao titulo="Movimentos de hoje" href="/painel/movimentos" />
          {movimentos.length ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {movimentos.map((m) => {
                const ok = m.estado === "autorizado" || m.estado === "confirmado_pais";
                return (
                  <div key={m._id.toString()} className="flex items-center justify-between gap-2 py-3 text-xs">
                    <span className="font-mono text-slate-500">{formatarHora(m.dataHora)}</span>
                    <span className="flex-1">{m.tipo === "entrada" ? "Entrada" : "Saída"}</span>
                    <span className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      {ok ? "Autorizado" : "Recusado"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">Ainda não há movimentos hoje.</p>
          )}
        </Cartao>

        <Cartao className="lg:col-span-2 xl:col-span-3">
          <CabecalhoCartao titulo={`Horário de hoje · ${horariosHoje.length} ${horariosHoje.length === 1 ? "aula" : "aulas"}`} href="/painel/horario" />
          {horariosHoje.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3 font-medium">Hora</th>
                    <th className="pb-3 font-medium">Disciplina</th>
                    <th className="pb-3 font-medium">Sala</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {horariosHoje.map((h) => {
                    const estado = agoraHora >= h.horaFim ? "Concluída" : agoraHora >= h.horaInicio ? "A decorrer" : "Pendente";
                    return (
                      <tr key={`${h.horaInicio}-${h.disciplina}`} className="schedule-row border-t border-slate-200 dark:border-slate-800">
                        <td className="py-3 font-mono tabular-nums">{h.horaInicio}–{h.horaFim}</td>
                        <td className="py-3 font-medium">{h.disciplina}</td>
                        <td className="py-3 text-slate-500">{h.sala ?? "—"}</td>
                        <td className="py-3">
                          <span className={estado === "Concluída" ? "text-emerald-600 dark:text-emerald-400" : estado === "A decorrer" ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}>
                            ● {estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">Não há aulas previstas para hoje.</p>
          )}
        </Cartao>
      </div>
    </>
  );
}

function CabecalhoCartao({ titulo, href }: { titulo: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-sm font-semibold">{titulo}</h2>
      <Link href={href} className="hover-highlight rounded-md px-1 py-0.5 text-xs font-medium text-blue-700 hover:underline dark:text-blue-400">
        Ver tudo →
      </Link>
    </div>
  );
}

function StatLinha({ tipo, titulo, valor }: { tipo: "presencas" | "atrasos" | "faltas"; titulo: string; valor: number }) {
  const estilos = {
    presencas: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    atrasos: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    faltas: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  };
  const pontos = { presencas: "bg-emerald-500", atrasos: "bg-amber-400", faltas: "bg-rose-500" };

  return (
    <div className={`hover-highlight rounded-xl border p-2.5 ${estilos[tipo]}`}>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${pontos[tipo]}`} />
        <span className="truncate text-[10px] font-medium">{titulo}</span>
      </div>
      <p className="mt-2 text-2xl font-bold leading-none tabular-nums">{valor}</p>
    </div>
  );
}
