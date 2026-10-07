import type { TipoRegisto } from "@/lib/constantes";

/**
 * Alterna sempre com o último registo (sem nenhum: entrada). Função pura para a MESMA regra valer ao gerar
 * o QR e ao lê-lo (ver `validarTokenQR`).
 */
export function proximoTipoRegisto(ultimoTipo: TipoRegisto | undefined): TipoRegisto {
  return ultimoTipo === "entrada" ? "saida" : "entrada";
}
