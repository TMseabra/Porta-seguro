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

export const TIPOS_OCORRENCIA = [
  "qr_expirado",
  "qr_ja_utilizado",
  "qr_aluno_diferente",
  "qr_tipo_incorreto",
  "entrada_suspenso",
] as const;
export type TipoOcorrencia = (typeof TIPOS_OCORRENCIA)[number];
