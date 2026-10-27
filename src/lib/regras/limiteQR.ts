export const MAX_CODIGOS_POR_MINUTO = 3;
const JANELA_MS = 60 * 1000;

export type ResultadoLimiteQR = { permitido: true } | { permitido: false; esperarSegundos: number };

/**
 * Um aluno só pode gerar `MAX_CODIGOS_POR_MINUTO` códigos em qualquer janela de 60 segundos (conta os que
 * foram criados há menos de um minuto, incluindo os já usados). Se atingiu o limite, diz quantos segundos
 * faltam para o mais antigo da janela "sair" e libertar uma vaga.
 */
export function limiteDeCodigosQR(criadosEm: Date[], agora: Date): ResultadoLimiteQR {
  const naJanela = criadosEm
    .filter((data) => agora.getTime() - data.getTime() < JANELA_MS)
    .sort((a, b) => a.getTime() - b.getTime());

  if (naJanela.length < MAX_CODIGOS_POR_MINUTO) return { permitido: true };

  const quemTemDeSair = naJanela[naJanela.length - MAX_CODIGOS_POR_MINUTO];
  const faltaMs = quemTemDeSair.getTime() + JANELA_MS - agora.getTime();
  return { permitido: false, esperarSegundos: Math.ceil(faltaMs / 1000) };
}
