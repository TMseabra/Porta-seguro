import { exigirSessao } from "@/lib/permissoes";
import { ShellPainel } from "./shell";

/**
 * Menu e barra de topo vivem no layout: não são redesenhados ao navegar, só o conteúdo troca (com o
 * loading.tsx logo a seguir). Antes cada clique esperava pelas consultas à BD.
 */
export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSessao();
  return <ShellPainel sessao={sessao}>{children}</ShellPainel>;
}
