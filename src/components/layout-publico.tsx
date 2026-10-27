import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { BotaoTema } from "@/components/botao-tema";

/** Barra, conteúdo e rodapé das páginas públicas (/, /funcionalidades, /seguranca, /sobre). */

export type PaginaPublica = "inicio" | "funcionalidades" | "seguranca" | "sobre";

const LINKS: { chave: PaginaPublica; href: string; label: string }[] = [
  { chave: "funcionalidades", href: "/funcionalidades", label: "Funcionalidades" },
  { chave: "seguranca", href: "/seguranca", label: "Segurança" },
  { chave: "sobre", href: "/sobre", label: "Sobre o projeto" },
];

export async function LayoutPublico({ ativa, children }: { ativa: PaginaPublica; children: React.ReactNode }) {
  const sessao = await auth();

  return (
    <div className="flex min-h-full flex-col">
      <header className="barra">
        <div className="barra-titulo">
          <Link href="/">
            <Logo className="h-7 w-7" decorativa />
            PortãoSeguro
          </Link>
        </div>

        <nav aria-label="Páginas" className="barra-links">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={link.chave === ativa ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>

        <BotaoTema />
        <Link href={sessao?.user ? "/painel" : "/login"}>{sessao?.user ? "Painel" : "Entrar"}</Link>
      </header>

      <main className="pagina">{children}</main>

      <footer className="rodape">PortãoSeguro · Projeto UFCD 10790</footer>
    </div>
  );
}

/** Título e subtítulo no topo das páginas secundárias. */
export function TopoPagina({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div>
      <h1>{titulo}</h1>
      <p className="subtitulo">{descricao}</p>
    </div>
  );
}

export function CartaoPublico({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="cartao">
      <h2>{titulo}</h2>
      <p>{children}</p>
    </div>
  );
}
