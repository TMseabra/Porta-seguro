"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Do lado do browser porque o layout não é redesenhado ao mudar de página: quem destaca o item é o usePathname(). */

export interface ItemNav {
  href: string;
  label: string;
}

export function MenuPainel({ itens }: { itens: ItemNav[] }) {
  const caminho = usePathname();
  return (
    <nav aria-label="Menu principal" className="menu">
      {itens.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          aria-current={caminho === item.href ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function TituloAtual({ itens }: { itens: ItemNav[] }) {
  const caminho = usePathname();
  return <>{itens.find((item) => item.href === caminho)?.label ?? "Painel"}</>;
}
