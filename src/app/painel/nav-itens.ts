/**
 * Itens do menu do aluno. Fica num ficheiro "normal" (sem "use client")
 * para poder ser importado tanto pelo layout do servidor como pelos
 * componentes de navegação do browser — um valor exportado de um ficheiro
 * "use client" não chega ao servidor como o array em si.
 */
export const NAV_ALUNO = [
  { href: "/painel", label: "Painel", icon: "▦" },
  { href: "/painel/qr", label: "Código QR", icon: "▧" },
  { href: "/painel/horario", label: "Horário", icon: "◷" },
  { href: "/painel/assiduidade", label: "Assiduidade", icon: "◉" },
  { href: "/painel/movimentos", label: "Movimentos", icon: "⟳" },
  { href: "/painel/definicoes", label: "Definições", icon: "⚙" },
] as const;
