import type { Session } from "next-auth";
import { Logo } from "@/components/logo";
import { signOut } from "@/auth";
import type { Perfil } from "@/lib/constantes";
import { BotaoTema } from "@/components/botao-tema";
import { NAV_ALUNO } from "./nav-itens";
import { atalhosDoPerfil } from "./atalhos";
import { MenuPainel, TituloAtual, type ItemNav } from "./nav-painel";

/** Barra de topo e menu comuns a todas as páginas da área reservada; usada uma vez, no layout. */

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
  const itens: ItemNav[] =
    sessao.user.perfil === "aluno"
      ? NAV_ALUNO.map((item) => ({ href: item.href, label: item.label }))
      : [
          { href: "/painel", label: "Painel" },
          ...atalhosDoPerfil(sessao.user.perfil).map((atalho) => ({ href: atalho.href, label: atalho.titulo })),
        ];

  return (
    <div className="flex min-h-full flex-col">
      <header className="barra">
        <div className="barra-titulo">
          <Logo className="h-7 w-7" decorativa />
          <span>
            PortãoSeguro — <TituloAtual itens={itens} />
          </span>
        </div>

        <span className="hidden text-sm sm:inline">
          {sessao.user.name} · {ROTULO_PERFIL[sessao.user.perfil]}
        </span>
        <BotaoTema />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit">Sair</button>
        </form>
      </header>

      <MenuPainel itens={itens} />

      <main className="pagina">
        <div className="empilhado">{children}</div>
      </main>
    </div>
  );
}

export function TituloPagina({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div>
      <h1>{titulo}</h1>
      {descricao && <p className="subtitulo">{descricao}</p>}
    </div>
  );
}

export function Cartao({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`cartao ${className}`}>{children}</section>;
}
