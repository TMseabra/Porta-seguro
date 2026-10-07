"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Do lado do browser porque o layout não é redesenhado ao mudar de página: quem destaca o item é o usePathname(). */

export interface ItemNav {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function ativo(caminho: string, href: string) {
  return caminho === href;
}

export function NavLateral({ itens }: { itens: ItemNav[] }) {
  const caminho = usePathname();
  return (
    <nav aria-label="Menu principal" className="space-y-1">
      {itens.map((item) => {
        const selecionado = ativo(caminho, item.href);
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            aria-current={selecionado ? "page" : undefined}
            className={`hover-highlight flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm transition ${
              selecionado
                ? "bg-blue-700 font-semibold text-white shadow-sm shadow-blue-950/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-white/[.05] dark:hover:text-white"
            }`}
          >
            <span className="flex w-4 justify-center text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavRapida({ itens }: { itens: ItemNav[] }) {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Navegação rápida"
      className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2.5 lg:hidden dark:border-white/[.08] dark:bg-[#0a0a0a]"
    >
      {itens.map((item) => {
        const selecionado = ativo(caminho, item.href);
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            aria-current={selecionado ? "page" : undefined}
            className={`hover-highlight flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
              selecionado
                ? "border-blue-700 bg-blue-700 text-white shadow-sm shadow-blue-950/20"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-white/[.03] dark:text-slate-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
            }`}
          >
            <span aria-hidden="true" className="text-sm leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TituloAtual({ itens }: { itens: ItemNav[] }) {
  const caminho = usePathname();
  return <>{itens.find((item) => ativo(caminho, item.href))?.label ?? "Painel"}</>;
}
