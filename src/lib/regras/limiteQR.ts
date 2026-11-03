export const MAX_CODIGOS_POR_MINUTO = 3;
const JANELA_MS = 60 * 1000;

export type ResultadoLimiteQR = { permitido: true } | { permitido: false; esperarSegundos: number };

export function limiteDeCodigosQR(criadosEm: Date[], agora: Date): ResultadoLimiteQR {
  const naJanela = criadosEm
    .filter((data) => agora.getTime() - data.getTime() < JANELA_MS)
    .sort((a, b) => a.getTime() - b.getTime());

  if (naJanela.length < MAX_CODIGOS_POR_MINUTO) return { permitido: true };

  const quemTemDeSair = naJanela[naJanela.length - MAX_CODIGOS_POR_MINUTO];
  const faltaMs = quemTemDeSair.getTime() + JANELA_MS - agora.getTime();
  return { permitido: false, esperarSegundos: Math.ceil(faltaMs / 1000) };
}
