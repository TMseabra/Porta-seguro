import Link from "next/link";
import type { Session } from "next-auth";
import { Logo } from "@/components/logo";
import { LogoTexto } from "@/components/logo-texto";
import { signOut } from "@/auth";
import type { Perfil } from "@/lib/constantes";
import { ThemeToggle } from "../theme-provider";

/**
 * Moldura comum a todas as páginas da área reservada: menu lateral, barra
 * de topo e navegação rápida no telemóvel. Cada item do menu do aluno é uma
 * página própria (/painel/qr, /painel/horario, ...) — esta peça só sabe qual
 * está ativa para a destacar, o conteúdo vem de quem a usa.
 */

export type ItemAluno = "painel" | "qr" | "horario" | "assiduidade" | "movimentos" | "definicoes";

export const NAV_ALUNO: { chave: ItemAluno; href: string; label: string; icon: string }[] = [
  { chave: "painel", href: "/painel", label: "Painel", icon: "▦" },
  { chave: "qr", href: "/painel/qr", label: "Código QR", icon: "▧" },
  { chave: "horario", href: "/painel/horario", label: "Horário", icon: "◷" },
  { chave: "assiduidade", href: "/painel/assiduidade", label: "Assiduidade", icon: "◉" },
  { chave: "movimentos", href: "/painel/movimentos", label: "Movimentos", icon: "⟳" },
  { chave: "definicoes", href: "/painel/definicoes", label: "Definições", icon: "⚙" },
];

export interface AtalhoDoPainel {
  href: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  perfis: Perfil[];
}

export const ROTULO_PERFIL: Record<Perfil, string> = {
  aluno: "Aluno",
  porteiro: "Porteiro",
  professor: "Professor",
  dt: "Diretor(a) de turma",
  coordenador: "Coordenador(a)",
  gestor: "Gestor(a)",
  admin: "Administrador",
};

export function ShellPainel({
  sessao,
  ativo,
  titulo,
  atalhos = [],
  children,
}: {
  sessao: Session;
  ativo: ItemAluno;
  titulo: string;
  /** Atalhos dos perfis que não são aluno (menu lateral). */
  atalhos?: AtalhoDoPainel[];
  children: React.ReactNode;
}) {
  const ehAluno = sessao.user.perfil === "aluno";
  const iniciais = (sessao.user.name ?? "PS")
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  const classeItem = (selecionado: boolean) =>
    `hover-highlight flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm transition ${
      selecionado
        ? "bg-blue-700 font-semibold text-white shadow-sm shadow-blue-950/20"
        : "text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-white/[.05] dark:hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-[#080b10] dark:text-slate-100">
      <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 dark:border-white/[.08] dark:bg-[#0b0f14] lg:flex xl:w-60 xl:px-4">
        <Link href="/" className="mb-10 flex items-center gap-2 px-2">
          <Logo className="h-10 w-10" decorativa />
          <span className="flex flex-col gap-1">
            <LogoTexto className="h-4" />
            <span className="text-[9px] tracking-[.14em] text-slate-500">ÁREA ESCOLAR</span>
          </span>
        </Link>
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Menu principal</p>
        <nav aria-label="Menu principal" className="space-y-1">
          {ehAluno ? (
            NAV_ALUNO.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.chave === ativo ? "page" : undefined}
                className={classeItem(item.chave === ativo)}
              >
                <span className="w-4 text-center text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))
          ) : (
            <>
              <Link href="/painel" aria-current="page" className={classeItem(true)}>
                <span>▦</span>Painel
              </Link>
              {atalhos.map((atalho) => (
                <Link key={atalho.href + atalho.titulo} href={atalho.href} className={classeItem(false)}>
                  <span className="text-blue-600 dark:text-blue-300">{atalho.icone}</span>
                  {atalho.titulo}
                </Link>
              ))}
            </>
          )}
        </nav>
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
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl dark:border-white/[.08] dark:bg-[#080c12]/90 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Logo className="h-8 w-8" decorativa />
            <LogoTexto className="h-4" />
          </div>
          <div className="hidden text-sm text-slate-500 lg:block">
            Área reservada <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-800 dark:text-slate-300">{titulo}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold">{sessao.user.name}</span>
              <span className="block text-xs text-slate-500">{ROTULO_PERFIL[sessao.user.perfil]}</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-blue-800 dark:border-white/10 dark:bg-[#172235] dark:text-blue-200">
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
                className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700 transition hover:border-red-600 hover:bg-red-600 hover:text-white dark:border-white/10 dark:text-slate-300"
              >
                Sair
              </button>
            </form>
          </div>
        </header>

        {ehAluno && (
          <nav
            aria-label="Navegação rápida"
            className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden dark:border-white/[.08] dark:bg-[#0b0f14]"
          >
            {NAV_ALUNO.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.chave === ativo ? "page" : undefined}
                className={`hover-highlight shrink-0 rounded-lg border border-transparent px-3 py-2 text-xs font-medium ${
                  item.chave === ativo
                    ? "bg-blue-700 text-white"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Cabeçalho de cada sub-página do aluno. */
export function TituloPagina({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{titulo}</h1>
      {descricao && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descricao}</p>}
    </div>
  );
}

/** Cartão com o mesmo aspeto em todas as páginas do painel. */
export function Cartao({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`hover-highlight rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0c1118] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}
