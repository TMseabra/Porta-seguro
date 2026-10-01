import type { Perfil } from "@/lib/constantes";

/**
 * Atalhos dos perfis que não são aluno. Usados em dois sítios: no menu
 * lateral (layout) e nos cartões da página /painel — por isso vivem aqui e
 * não dentro de nenhum dos dois.
 */
export interface AtalhoDoPainel {
  href: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  perfis: Perfil[];
}

const ATALHOS: AtalhoDoPainel[] = [
  { href: "/portao-teste", titulo: "Portão Teste", descricao: "Simular a leitura de um cartão ou código QR na portaria.", icone: <IconePorta />, perfis: ["porteiro", "admin"] },
  { href: "/consultas", titulo: "Consultar assiduidade", descricao: "Presenças, atrasos e faltas das turmas que coordenas.", icone: <IconeGrafico />, perfis: ["coordenador", "gestor", "admin"] },
  { href: "/horarios?vista=pessoal", titulo: "O meu horário", descricao: "As tuas aulas, dia a dia, nas turmas onde lecionas.", icone: <IconeCalendario />, perfis: ["professor"] },
  { href: "/horarios?vista=turma", titulo: "Horário de turmas", descricao: "O horário semanal das turmas a que estás associado.", icone: <IconeCalendario />, perfis: ["dt", "coordenador", "gestor", "admin"] },
  { href: "/horarios?vista=pessoal", titulo: "Horário de professores", descricao: "Ver as aulas de qualquer professor.", icone: <IconeCalendario />, perfis: ["gestor", "admin"] },
  { href: "/admin", titulo: "Administração", descricao: "Gerir cursos, turmas, horários e contas de alunos.", icone: <IconeEngrenagem />, perfis: ["gestor", "admin"] },
];

export function atalhosDoPerfil(perfil: Perfil): AtalhoDoPainel[] {
  return ATALHOS.filter((atalho) => atalho.perfis.includes(perfil));
}

function IconePorta() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden><rect x="4" y="3" width="13" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="13.5" cy="12" r="1" fill="currentColor"/><path d="M17 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
function IconeGrafico() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden><path d="M4 20V4M4 20h16M8 16v-4M12.5 16V8M17 16v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconeCalendario() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden><rect x="3.5" y="5" width="17" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
function IconeEngrenagem() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.55 1.55M7.15 16.85 5.6 18.4M18.4 18.4l-1.55-1.55M7.15 7.15 5.6 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
