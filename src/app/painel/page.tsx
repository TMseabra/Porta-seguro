import Link from "next/link";
import { exigirSessao } from "@/lib/permissoes";
import { DashboardAluno } from "./dashboard-aluno";
import { atalhosDoPerfil } from "./atalhos";

export default async function Painel({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sessao = await exigirSessao();
  const { erro } = await searchParams;
  const atalhos = atalhosDoPerfil(sessao.user.perfil);
  const ehAluno = sessao.user.perfil === "aluno";

  return (
    <>
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
    </>
  );
}
