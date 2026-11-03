import { exigirSessao } from "@/lib/permissoes";
import { ShellPainel } from "./shell";

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSessao();
  return <ShellPainel sessao={sessao}>{children}</ShellPainel>;
}
