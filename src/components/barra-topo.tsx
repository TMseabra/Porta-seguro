import Link from "next/link";
import { signOut } from "@/auth";
import { Logo } from "@/components/logo";
import { BotaoTema } from "@/components/botao-tema";

/** Barra azul de topo das páginas internas: título à esquerda, ligações à direita. */
export function BarraTopo({
  titulo,
  voltar,
  comSair = false,
}: {
  titulo: string;
  voltar: { href: string; texto: string };
  comSair?: boolean;
}) {
  return (
    <header className="barra">
      <div className="barra-titulo">
        <Logo className="h-7 w-7" decorativa />
        {titulo}
      </div>

      <Link href={voltar.href}>{voltar.texto}</Link>
      <BotaoTema />
      {comSair && (
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit">Sair</button>
        </form>
      )}
    </header>
  );
}
