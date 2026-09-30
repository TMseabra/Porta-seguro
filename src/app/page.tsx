import Link from "next/link";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { LogoTexto } from "@/components/logo-texto";

const features = [
  ["QR temporário", "Cada código é válido por um minuto e só pode ser utilizado uma vez."],
  ["Decisões automáticas", "Entradas, saídas e atrasos calculados com base no horário."],
  ["Segurança desde o início", "Contas, sessões e operações protegidas em cada etapa."],
  ["Assiduidade clara", "Consulte presenças, atrasos e faltas num só lugar."],
];

export default async function PaginaInicial() {
  const sessao = await auth();
  const destino = sessao?.user ? "/painel" : "/login";
  const rotulo = sessao?.user ? "Ir para o painel" : "Entrar no sistema";
  const qr = await QRCode.toDataURL("DEMO-PORTAO-SEGURO-QR", { margin: 1, width: 240 });

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-10 w-10" decorativa />
            <span className="flex flex-col gap-1"><LogoTexto className="h-5" /><span className="text-[9px] font-semibold tracking-[.16em] text-slate-500">ENTRADAS ESCOLARES</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              <a href="#funcionalidades" className="hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300">Funcionalidades</a>
            <a href="#seguranca" className="hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300">Segurança</a>
            <a href="#projeto" className="hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300">Sobre o projeto</a>
            <Link href={destino} className="rounded-lg bg-slate-950 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">Entrar</Link>
          </nav>
          <Link href={destino} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white md:hidden">Entrar</Link>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_35%,rgba(37,99,235,.08),transparent_38%),radial-gradient(ellipse_at_85%_10%,rgba(15,23,42,.04),transparent_35%)]" />
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_.9fr] lg:gap-8 lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.14em] text-blue-700"><i className="h-1.5 w-1.5 rounded-full bg-blue-600" />Projeto UFCD 10790</span>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-[68px]">Entradas e saídas escolares, <span className="text-blue-600">simples e seguras.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">Códigos QR temporários, horários inteligentes e registo automático de assiduidade. Tudo num só sistema.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={destino} className="rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-blue-700">{rotulo}<span className="ml-3">→</span></Link>
              <a href="#funcionalidades" className="rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">Ver funcionalidades</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">{["QR de uso único", "Horários reais", "Assiduidade automática"].map((x) => <span key={x} className="flex items-center gap-2"><span className="text-blue-600">✓</span>{x}</span>)}</div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end lg:pr-10">
            <div className="absolute h-80 w-80 rounded-full bg-blue-100 blur-3xl" />
            <div className="relative w-[290px] rounded-[42px] border-[7px] border-slate-950 bg-slate-950 p-2 shadow-2xl shadow-slate-900/25 sm:w-[310px]">
              <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="min-h-[535px] overflow-hidden rounded-[32px] bg-[#0c1118] px-4 pb-5 pt-10 text-white">
                <div className="flex items-center justify-between"><div><p className="text-[10px] text-white/45">Segunda, 26 de maio</p><h2 className="mt-1 text-lg font-bold">Olá, João 👋</h2></div><span className="text-white/70">♧</span></div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-3.5"><div className="flex items-center justify-between text-[10px] font-semibold text-white/60"><span>Código QR temporário</span><span className="text-emerald-400">● ATIVO</span></div><div className="mx-auto mt-3 flex h-40 w-40 items-center justify-center rounded-lg bg-white p-2"><img src={qr} alt="Exemplo de código QR temporário" className="h-full w-full" /></div><p className="mt-3 text-center text-[10px] text-white/45">Válido por</p><p className="text-center text-lg font-bold text-blue-400">00:58</p><button className="mt-3 w-full rounded-lg border border-white/10 py-2 text-[10px] text-white/75">↻ Gerar novo código</button></div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.04] p-3.5"><p className="text-[10px] font-semibold text-white/50">Assiduidade (mês)</p><div className="mt-3 flex items-center gap-4"><div className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[7px] border-emerald-500 text-center"><span className="text-base font-black">94%</span></div><div className="space-y-1.5 text-[9px] text-white/75"><p><b className="text-emerald-400">●</b> Presenças　47</p><p><b className="text-amber-400">●</b> Atrasos　3</p><p><b className="text-violet-400">●</b> Faltas　2</p></div></div></div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.04] p-3.5"><p className="text-[10px] text-white/50">Próxima aula</p><div className="mt-2 flex justify-between"><div><p className="text-sm font-bold">11:00 · Programação</p><p className="text-[10px] text-white/40">Sala 12A</p></div><span className="text-[9px] text-blue-300">Hoje</span></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="mx-auto grid max-w-7xl gap-4 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {features.map(([title, desc], i) => <article key={title} className="border-l border-slate-200 px-5 py-2 dark:border-slate-800"><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-lg font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">{["▦", "◷", "◇", "▥"][i]}</div><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc}</p></article>)}
      </section>

      <section id="seguranca" className="bg-slate-950 px-5 py-14 text-white sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-7 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-400">Feito para a comunidade escolar</p><h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">Uma escola mais organizada começa à entrada.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Cada perfil tem acesso às ferramentas de que precisa, com informação clara e protegida.</p></div><div className="flex flex-wrap gap-2">{["Aluno", "Porteiro", "Professor", "DT", "Coordenador", "Gestor", "Admin"].map((r) => <span key={r} className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/75">{r}</span>)}</div></div></section>

      <footer id="projeto" className="flex flex-col gap-3 border-t border-slate-200 px-5 py-6 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>PortãoSeguro · Projeto UFCD 10790</span><span>Registo seguro de entradas, saídas e assiduidade</span></footer>
    </main>
  );
}
