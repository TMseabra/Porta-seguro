import type { MetodoRegisto, TipoRegisto } from "@/lib/constantes";
import { proximoTipoRegisto } from "./proximoTipo";

/**
 * Direção de um QR quando a conta de teste a escolheu à mão. Só conta numa SIMULAÇÃO: o `metodo` deduz-se
 * do código na BD, nunca do browser, e um código real segue sempre a alternância.
 */
export interface CodigoParaTipo {
  tipo: TipoRegisto;
  tipoEscolhido?: boolean;
}

function escolhaValida(codigo: CodigoParaTipo, metodo: MetodoRegisto): boolean {
  return codigo.tipoEscolhido === true && metodo === "simulacao";
}

export function tipoEsperadoNaLeitura(
  codigo: CodigoParaTipo,
  metodo: MetodoRegisto,
  ultimoTipo: TipoRegisto | undefined,
): TipoRegisto {
  return escolhaValida(codigo, metodo) ? codigo.tipo : proximoTipoRegisto(ultimoTipo);
}

export function tipoForcadoNoMovimento(
  codigo: CodigoParaTipo,
  metodo: MetodoRegisto,
): TipoRegisto | undefined {
  return escolhaValida(codigo, metodo) ? codigo.tipo : undefined;
}
