/**
 * Valores fixos usados nos modelos, na autenticação e nas regras de decisão, escritos uma só vez.
 * `as const` + `typeof X[number]` gera o tipo TypeScript da lista: o compilador avisa se se escrever
 * um valor que não existe (ex.: "profesor").
 */

/**
 * O "porteiro" não estava na análise mas é o utilizador principal da portaria. O "gestor" tem as
 * permissões do admin exceto o Portão Teste: onde se verifica `perfil === "admin"`, pensar se o
 * gestor também entra.
 */
export const PERFIS = [
  "aluno",
  "porteiro",
  "professor",
  "dt",
  "coordenador",
  "gestor",
  "admin",
] as const;
export type Perfil = (typeof PERFIS)[number];

export const TIPOS_REGISTO = ["entrada", "saida"] as const;
export type TipoRegisto = (typeof TIPOS_REGISTO)[number];

export const METODOS_REGISTO = ["cartao", "qr", "simulacao"] as const;
export type MetodoRegisto = (typeof METODOS_REGISTO)[number];

export const ESTADOS_REGISTO = [
  "autorizado",
  "nao_autorizado",
  "confirmado_pais",
] as const;
export type EstadoRegisto = (typeof ESTADOS_REGISTO)[number];

/**
 * Tipos de ocorrência (RF16 + RF03): QR expirado, já usado, de outro aluno ou na direção errada,
 * e tentativa de entrada de suspensos.
 */
export const TIPOS_OCORRENCIA = [
  "qr_expirado",
  "qr_ja_utilizado",
  "qr_aluno_diferente",
  "qr_tipo_incorreto",
  "entrada_suspenso",
] as const;
export type TipoOcorrencia = (typeof TIPOS_OCORRENCIA)[number];
