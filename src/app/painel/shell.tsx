import Link from "next/link";
import type { Session } from "next-auth";
import { Logo } from "@/components/logo";
import { LogoTexto } from "@/components/logo-texto";
import { signOut } from "@/auth";
import type { Perfil } from "@/lib/constantes";
import { ModeToggle } from "@/components/mode-toggle";
import { NAV_ALUNO } from "./nav-itens";
import { atalhosDoPerfil } from "./atalhos";
import { NavLateral, NavRapida, TituloAtual, type ItemNav } from "./nav-painel";

/** Moldura comum (menu, topo, navegação móvel), usada uma vez no layout. */

export const ROTULO_PERFIL: Record<Perfil, string> = {
  aluno: "Aluno",
  porteiro: "Porteiro",
  professor: "Professor",
  dt: "Diretor(a) de turma",
  coordenador: "Coordenador(a)",
  gestor: "Gestor(a)",
  admin: "Administrador",
};

export function ShellPainel({ sessao, children }: { sessao: Session; children: React.ReactNode }) {
  const ehAluno = sessao.user.perfil === "aluno";
  const iniciais = (sessao.user.name ?? "PS")
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  const itens: ItemNav[] = ehAluno
    ? NAV_ALUNO.map((item) => ({ href: item.href, label: item.label, icon: item.icon }))
    : [
        { href: "/painel", label: "Painel", icon: "▦" },
        ...atalhosDoPerfil(sessao.user.perfil).map((atalho) => ({
          href: atalho.href,
          label: atalho.titulo,
          icon: <span className="text-blue-600 dark:text-blue-300">{atalho.icone}</span>,
        })),
      ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-[#000000] dark:text-slate-100">
      <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 dark:border-white/[.08] dark:bg-[#0a0a0a] lg:flex xl:w-60 xl:px-4">
        <Link href="/" className="mb-10 flex items-center gap-2 px-2">
          <Logo className="h-10 w-10" decorativa />
          <span className="flex flex-col gap-1">
            <LogoTexto className="h-4" />
            <span className="text-[9px] tracking-[.14em] text-slate-500">ÁREA ESCOLAR</span>
          </span>
        </Link>
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Menu principal</p>
        <NavLateral itens={itens} />
        <form
          className="mt-auto"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-500 transition hover:bg-red-600 hover:text-white"
          >
            ↪　Terminar sessão
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl dark:border-white/[.08] dark:bg-[#000000]/90 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <Logo className="h-8 w-8 shrink-0" decorativa />
            {/* No telemóvel fica só o escudo e o nome da página: o nome do
                site por extenso não cabia ao lado do botão do tema. */}
            <p className="truncate text-sm font-semibold"><TituloAtual itens={itens} /></p>
          </div>
          <div className="hidden text-sm text-slate-500 lg:block">
            Área reservada <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-800 dark:text-slate-300"><TituloAtual itens={itens} /></span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ModeToggle />
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold">{sessao.user.name}</span>
              <span className="block text-xs text-slate-500">{ROTULO_PERFIL[sessao.user.perfil]}</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-blue-800 dark:border-white/10 dark:bg-[#1f1f1f] dark:text-blue-200">
              {iniciais}
            </span>
            <form
              className="lg:hidden"
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-2.5 text-xs text-slate-700 transition hover:border-red-600 hover:bg-red-600 hover:text-white dark:border-white/10 dark:text-slate-300"
              >
                Sair
              </button>
            </form>
          </div>
        </header>

        {ehAluno && <NavRapida itens={itens} />}

        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export function TituloPagina({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{titulo}</h1>
      {descricao && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descricao}</p>}
    </div>
  );
}

export function Cartao({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`hover-highlight rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0a0a0a] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}
