import Link from "next/link";
import { exigirSessao } from "@/lib/permissoes";
import { DashboardAluno } from "./dashboard-aluno";
import { ShellPainel, type AtalhoDoPainel } from "./shell";

const ATALHOS: AtalhoDoPainel[] = [
  { href: "/portao-teste", titulo: "Portão Teste", descricao: "Simular a leitura de um cartão ou código QR na portaria.", icone: <IconePorta />, perfis: ["porteiro", "admin"] },
  { href: "/consultas", titulo: "Consultar assiduidade", descricao: "Presenças, atrasos e faltas das turmas que coordenas.", icone: <IconeGrafico />, perfis: ["coordenador", "gestor", "admin"] },
  { href: "/horarios?vista=pessoal", titulo: "O meu horário", descricao: "As tuas aulas, dia a dia, nas turmas onde lecionas.", icone: <IconeCalendario />, perfis: ["professor"] },
  { href: "/horarios?vista=turma", titulo: "Horário de turmas", descricao: "O horário semanal das turmas a que estás associado.", icone: <IconeCalendario />, perfis: ["dt", "coordenador", "gestor", "admin"] },
  { href: "/horarios?vista=pessoal", titulo: "Horário de professores", descricao: "Ver as aulas de qualquer professor.", icone: <IconeCalendario />, perfis: ["gestor", "admin"] },
  { href: "/admin", titulo: "Administração", descricao: "Gerir cursos, turmas, horários e contas de alunos.", icone: <IconeEngrenagem />, perfis: ["gestor", "admin"] },
];

export default async function Painel({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sessao = await exigirSessao();
  const { erro } = await searchParams;
  const atalhos = ATALHOS.filter((item) => item.perfis.includes(sessao.user.perfil));
  const ehAluno = sessao.user.perfil === "aluno";

  return (
    <ShellPainel sessao={sessao} ativo="painel" titulo="Painel" atalhos={atalhos}>
      {erro === "sem-permissao" && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          Não tens permissão para aceder a essa página.
        </p>
      )}

      {ehAluno ? (
        <DashboardAluno alunoId={sessao.user.id} email={sessao.user.email} nome={sessao.user.name ?? "Aluno"} />
      ) : (
        <>
          <div>
            <p className="text-xs font-medium text-slate-500">Bem-vindo de volta</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Olá, {sessao.user.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Acede rapidamente às ferramentas da tua área.</p>
          </div>
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">As tuas ferramentas</h2>
              <p className="mt-1 text-sm text-slate-500">Atalhos disponíveis para o teu perfil.</p>
            </div>
            {atalhos.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[.03] dark:text-slate-400">
                Ainda não há nada configurado para o teu perfil.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {atalhos.map((atalho) => (
                  <Link
                    key={atalho.href + atalho.titulo}
                    href={atalho.href}
                    className="group flex min-h-36 items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg dark:border-white/[.09] dark:bg-[#10151c] dark:hover:border-blue-500/50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-300">
                      {atalho.icone}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="font-semibold">{atalho.titulo}</span>
                      <span className="text-sm leading-6 text-slate-500 dark:text-slate-400">{atalho.descricao}</span>
                    </span>
                    <span className="ml-auto text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">→</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </ShellPainel>
  );
}

function IconePorta() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden><rect x="4" y="3" width="13" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="13.5" cy="12" r="1" fill="currentColor"/><path d="M17 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
function IconeGrafico() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden><path d="M4 20V4M4 20h16M8 16v-4M12.5 16V8M17 16v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconeCalendario() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden><rect x="3.5" y="5" width="17" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
function IconeEngrenagem() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.55 1.55M7.15 16.85 5.6 18.4M18.4 18.4l-1.55-1.55M7.15 7.15 5.6 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
