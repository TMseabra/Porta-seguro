import { exigirSessao } from "@/lib/permissoes";
import { ShellPainel } from "./shell";

/**
 * O menu lateral e a barra de topo vivem aqui, no layout, e não em cada
 * página. Um layout do Next.js mantém-se no ecrã quando se navega entre as
 * páginas que estão dentro dele — antes, cada clique no menu voltava a
 * desenhar tudo (menu incluído) e só mostrava alguma coisa depois de todas
 * as consultas à base de dados terminarem, daí a demora que se notava.
 * Agora o menu fica parado e só o conteúdo do meio troca, com o
 * loading.tsx a aparecer de imediato enquanto os dados chegam.
 */
export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSessao();
  return <ShellPainel sessao={sessao}>{children}</ShellPainel>;
}
