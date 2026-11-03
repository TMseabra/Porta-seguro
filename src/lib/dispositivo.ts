export function ehUserAgentDeTelemovel(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
}

export const EMAIL_CONTA_DE_TESTE_QR = "5802@eclisboa.net";
