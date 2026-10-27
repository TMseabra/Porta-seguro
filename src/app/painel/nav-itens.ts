/** Sem "use client": o servidor não recebe o array de um ficheiro de cliente. */
export const NAV_ALUNO = [
  { href: "/painel", label: "Painel" },
  { href: "/painel/qr", label: "Código QR" },
  { href: "/painel/horario", label: "Horário" },
  { href: "/painel/assiduidade", label: "Assiduidade" },
  { href: "/painel/movimentos", label: "Movimentos" },
  { href: "/painel/definicoes", label: "Definições" },
] as const;
