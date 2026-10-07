/**
 * Deteção aproximada (User-Agent) para RESTRINGIR onde o QR se gera (RF15). Não é segurança forte: o
 * User-Agent falsifica-se.
 */
export function ehUserAgentDeTelemovel(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
}

/** Único aluno que gera o QR num PC, para a defesa oral. */
export const EMAIL_CONTA_DE_TESTE_QR = "5802@eclisboa.net";
