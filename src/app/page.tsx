import Link from "next/link";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { LayoutPublico, CartaoPublico } from "@/components/layout-publico";

const DESTAQUES: [string, string, string][] = [
  ["▧", "QR temporário", "Cada código é válido por um minuto e só pode ser utilizado uma vez."],
  ["◷", "Decisões automáticas", "Entradas, saídas e atrasos calculados com base no horário."],
  ["◇", "Segurança desde o início", "Contas, sessões e operações protegidas em cada etapa."],
  ["▥", "Assiduidade clara", "Presenças, atrasos e faltas num só lugar."],
];

export default async function PaginaInicial() {
  const sessao = await auth();
  const destino = sessao?.user ? "/painel" : "/login";
  const rotulo = sessao?.user ? "Ir para o painel" : "Entrar no sistema";
  const qr = await QRCode.toDataURL("DEMO-PORTAO-SEGURO-QR", { margin: 1, width: 240 });

  return (
    <LayoutPublico ativa="inicio">
      <section className="relative isolate overflow-hidden border-b border-slate-100 dark:border-white/[.06]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_35%,rgba(37,99,235,.08),transparent_38%)] dark:hidden" />
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_.9fr] lg:gap-8 lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.14em] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              <i className="h-1.5 w-1.5 rounded-full bg-blue-600" />Projeto UFCD 10790
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-[68px]">
              Entradas e saídas escolares, <span className="text-blue-600 dark:text-blue-400">simples e seguras.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Códigos QR temporários, horários inteligentes e registo automático de assiduidade. Tudo num só sistema.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={destino} className="rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200">
                {rotulo}<span className="ml-3">→</span>
              </Link>
              <Link href="/funcionalidades" className="rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/[.05]">
                Ver funcionalidades
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              {["QR de uso único", "Horários reais", "Assiduidade automática"].map((x) => (
                <span key={x} className="flex items-center gap-2"><span className="text-blue-600">✓</span>{x}</span>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end lg:pr-10">
            <div className="absolute h-80 w-80 rounded-full bg-blue-100 blur-3xl dark:bg-blue-500/10" />
            <div className="relative w-[290px] rounded-[42px] border-[7px] border-slate-950 bg-slate-950 p-2 shadow-2xl shadow-slate-900/25 sm:w-[310px] dark:border-slate-700">
              <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="min-h-[535px] overflow-hidden rounded-[32px] bg-[#0a0a0a] px-4 pb-5 pt-10 text-white">
                <div className="flex items-center justify-between"><div><p className="text-[10px] text-white/45">Segunda, 26 de maio</p><p className="mt-1 text-lg font-bold">Olá, João 👋</p></div><span className="text-white/70">♧</span></div>
                {/* eslint-disable-next-line @next/next/no-img-element -- QR gerado no servidor como data URL, não há nada para o next/image otimizar */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-3.5"><div className="flex items-center justify-between text-[10px] font-semibold text-white/60"><span>Código QR temporário</span><span className="text-emerald-400">● ATIVO</span></div><div className="mx-auto mt-3 flex h-40 w-40 items-center justify-center rounded-lg bg-white p-2"><img src={qr} alt="Exemplo de código QR temporário" className="h-full w-full" /></div><p className="mt-3 text-center text-[10px] text-white/45">Válido por</p><p className="text-center text-lg font-bold text-blue-400">00:58</p><span className="mt-3 block w-full rounded-lg border border-white/10 py-2 text-center text-[10px] text-white/75">↻ Gerar novo código</span></div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.04] p-3.5"><p className="text-[10px] font-semibold text-white/50">Assiduidade (mês)</p><div className="mt-3 flex items-center gap-4"><div className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[7px] border-emerald-500 text-center"><span className="text-base font-black">94%</span></div><div className="space-y-1.5 text-[9px] text-white/75"><p><b className="text-emerald-400">●</b> Presenças　47</p><p><b className="text-amber-400">●</b> Atrasos　3</p><p><b className="text-violet-400">●</b> Faltas　2</p></div></div></div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.04] p-3.5"><p className="text-[10px] text-white/50">Próxima aula</p><div className="mt-2 flex justify-between"><div><p className="text-sm font-bold">11:00 · Programação</p><p className="text-[10px] text-white/40">Sala 12A</p></div><span className="text-[9px] text-blue-300">Hoje</span></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-black tracking-tight">O essencial</h2>
          <Link href="/funcionalidades" className="text-sm font-semibold text-blue-700 hover:underline dark:text-blue-400">
            Ver todas as funcionalidades →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESTAQUES.map(([icone, titulo, texto]) => (
            <CartaoPublico key={titulo} titulo={titulo} icone={icone}>{texto}</CartaoPublico>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-7 rounded-2xl border border-slate-200 p-6 sm:p-10 md:flex-row md:items-center md:justify-between dark:border-white/[.08] dark:bg-white/[.03]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700 dark:text-blue-400">Feito para a comunidade escolar</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight">Uma escola mais organizada começa à entrada.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Cada perfil tem acesso só às ferramentas de que precisa.{" "}
              <Link href="/seguranca" className="font-semibold text-blue-700 hover:underline dark:text-blue-400">Como protegemos os dados →</Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:max-w-sm">
            {["Aluno", "Porteiro", "Professor", "DT", "Coordenador", "Gestor", "Admin"].map((r) => (
              <span key={r} className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-700 dark:border-white/15 dark:text-white/75">{r}</span>
            ))}
          </div>
        </div>
      </section>
    </LayoutPublico>
  );
}
