import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { LogoTexto } from "@/components/logo-texto";
import { ThemeToggle } from "@/app/theme-provider";

/**
 * Cabeçalho, fundo e rodapé comuns às páginas públicas (/, /funcionalidades,
 * /seguranca, /sobre). Cada uma é uma página própria — antes eram secções
 * da página inicial a que se chegava por âncoras (#funcionalidades...).
 *
 * O fundo no modo escuro é sempre o mesmo (`FUNDO`), em todas as secções:
 * antes a página misturava faixas pretas com outras azuladas.
 */

export type PaginaPublica = "inicio" | "funcionalidades" | "seguranca" | "sobre";

const LINKS: { chave: PaginaPublica; href: string; label: string }[] = [
  { chave: "funcionalidades", href: "/funcionalidades", label: "Funcionalidades" },
  { chave: "seguranca", href: "/seguranca", label: "Segurança" },
  { chave: "sobre", href: "/sobre", label: "Sobre o projeto" },
];

export async function LayoutPublico({ ativa, children }: { ativa: PaginaPublica; children: React.ReactNode }) {
  const sessao = await auth();
  const destino = sessao?.user ? "/painel" : "/login";

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 dark:bg-[#080b10] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/[.08] dark:bg-[#080b10]/90">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="PortãoSeguro — página principal">
            <Logo className="h-10 w-10" decorativa />
            {/* No telemóvel fica só o escudo: o nome por extenso não cabia
                ao lado do botão do tema e do "Entrar". */}
            <span className="hidden flex-col gap-1 md:flex">
              <LogoTexto className="h-5" />
              <span className="text-[9px] font-semibold tracking-[.16em] text-slate-500">ENTRADAS ESCOLARES</span>
            </span>
          </Link>

          <nav aria-label="Páginas" className="hidden items-center gap-7 text-sm font-medium md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.chave === ativa ? "page" : undefined}
                className={
                  link.chave === ativa
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={destino}
              className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-200 sm:px-5"
            >
              {sessao?.user ? "Painel" : "Entrar"}
            </Link>
          </div>
        </div>

        {/* No telemóvel os links passam para uma linha própria por baixo. */}
        <nav aria-label="Páginas" className="flex gap-2 overflow-x-auto px-5 pb-3 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.chave === ativa ? "page" : undefined}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                link.chave === ativa
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 dark:border-white/[.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>PortãoSeguro · Projeto UFCD 10790</span>
          <span className="flex gap-4">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-blue-700 dark:hover:text-blue-400">
                {link.label}
              </Link>
            ))}
          </span>
        </div>
      </footer>
    </div>
  );
}

/** Cabeçalho de topo das páginas secundárias (/funcionalidades, ...). */
export function TopoPagina({ etiqueta, titulo, descricao }: { etiqueta: string; titulo: React.ReactNode; descricao: string }) {
  return (
    <section className="border-b border-slate-100 dark:border-white/[.06]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700 dark:text-blue-400">{etiqueta}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.04em] sm:text-5xl">{titulo}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{descricao}</p>
      </div>
    </section>
  );
}

/** Cartão das páginas públicas — mesmo fundo em todas, claro ou escuro. */
export function CartaoPublico({ titulo, icone, children }: { titulo: string; icone?: string; children: React.ReactNode }) {
  return (
    <article className="hover-highlight rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[.08] dark:bg-white/[.03]">
      {icone && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          {icone}
        </div>
      )}
      <h2 className="text-lg font-bold">{titulo}</h2>
      <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{children}</div>
    </article>
  );
}
