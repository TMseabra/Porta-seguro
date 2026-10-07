/** Sem "use client": o servidor não recebe o array de um ficheiro de cliente. */
export const NAV_ALUNO = [
  { href: "/painel", label: "Painel", icon: "▦" },
  { href: "/painel/qr", label: "Código QR", icon: "▧" },
  { href: "/painel/horario", label: "Horário", icon: "◷" },
  { href: "/painel/assiduidade", label: "Assiduidade", icon: "◉" },
  { href: "/painel/movimentos", label: "Movimentos", icon: "⟳" },
  { href: "/painel/definicoes", label: "Definições", icon: "⚙" },
] as const;
