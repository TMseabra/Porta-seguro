export { decidirSaida, type AlunoParaDecisaoSaida, type DecisaoSaida } from "./decidirSaida";
export {
  decidirEntrada,
  type AlunoParaDecisaoEntrada,
  type DecisaoEntrada,
} from "./decidirEntrada";
export {
  validarTokenQR,
  type DadosTokenQR,
  type MotivoTokenInvalido,
  type ResultadoValidacaoQR,
} from "./validarTokenQR";
export { encontrarBlocoADecorrer } from "./horarios";
export { proximoTipoRegisto } from "./proximoTipo";
export { limiteDeCodigosQR, MAX_CODIGOS_POR_MINUTO, type ResultadoLimiteQR } from "./limiteQR";
export {
  tipoEsperadoNaLeitura,
  tipoForcadoNoMovimento,
  type CodigoParaTipo,
} from "./tipoDoCodigo";
export {
  calcularEstadoPorta,
  type EstadoPorta,
  type ResultadoEstadoPorta,
} from "./estadoPorta";
