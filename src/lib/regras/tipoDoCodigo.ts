import type { MetodoRegisto, TipoRegisto } from "@/lib/constantes";
import { proximoTipoRegisto } from "./proximoTipo";

/**
 * Direção de um código QR na leitura, quando o aluno de teste escolheu à
 * mão se o código é de entrada ou de saída (`tipoEscolhido`).
 *
 * Só conta quando o movimento é uma SIMULAÇÃO. É o `metodo` — que o
 * servidor deduz do código guardado na base de dados, nunca do browser —
 * que decide: um código real (`"qr"`) ignora a escolha e segue sempre a
 * alternância normal, mesmo que alguma vez ficasse marcado por engano.
 *
 * Duas funções, uma por pergunta que a leitura faz:
 *  - `tipoEsperadoNaLeitura` — "que direção devia este código ter?", para
 *    o `validarTokenQR` recusar um código fora da direção.
 *  - `tipoForcadoNoMovimento` — "força a direção ao registar?", para o
 *    `processarMovimento` não a recalcular pela alternância.
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
