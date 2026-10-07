/** Ponto único de acesso aos modelos: `import { Utilizador } from "@/models"`. */

export { Curso, type ICurso } from "./Curso";
export { Turma, type ITurma } from "./Turma";
export { Utilizador, type IUtilizador } from "./Utilizador";
export { Horario, type IHorario } from "./Horario";
export { Registo, type IRegisto } from "./Registo";
export { TokenQR, type ITokenQR } from "./TokenQR";
export { Ocorrencia, type IOcorrencia } from "./Ocorrencia";
export {
  TentativaLogin,
  type ITentativaLogin,
  MAX_TENTATIVAS,
  JANELA_MINUTOS,
} from "./TentativaLogin";
export {
  CodigoVerificacao,
  type ICodigoVerificacao,
  VALIDADE_CODIGO_MINUTOS,
  MAX_TENTATIVAS_CODIGO,
} from "./CodigoVerificacao";
