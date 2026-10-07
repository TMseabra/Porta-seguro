import { LinkVoltar } from "./link-voltar";

/** Voltar ao painel, nos ecrãs de 1.º nível. Mais fundo na hierarquia usa-se `LinkVoltar` com o ecrã-pai. */
export function LinkVoltarPainel() {
  return <LinkVoltar href="/painel" label="Painel" />;
}
