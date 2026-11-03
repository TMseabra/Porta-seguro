import type { TipoRegisto } from "@/lib/constantes";

export function proximoTipoRegisto(ultimoTipo: TipoRegisto | undefined): TipoRegisto {
  return ultimoTipo === "entrada" ? "saida" : "entrada";
}
