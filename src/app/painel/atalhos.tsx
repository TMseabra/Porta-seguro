import type { Perfil } from "@/lib/constantes";

/** Atalhos dos perfis que não são aluno, usados no menu lateral e nos cartões de /painel. */
export interface AtalhoDoPainel {
  href: string;
  titulo: string;
  descricao: string;
  perfis: Perfil[];
}

const ATALHOS: AtalhoDoPainel[] = [
  { href: "/portao-teste", titulo: "Portão Teste", descricao: "Simular a leitura de um cartão ou código QR na portaria.", perfis: ["porteiro", "admin"] },
  { href: "/consultas", titulo: "Consultar assiduidade", descricao: "Presenças, atrasos e faltas das turmas que coordenas.", perfis: ["coordenador", "gestor", "admin"] },
  { href: "/horarios?vista=pessoal", titulo: "O meu horário", descricao: "As tuas aulas, dia a dia, nas turmas onde lecionas.", perfis: ["professor"] },
  { href: "/horarios?vista=turma", titulo: "Horário de turmas", descricao: "O horário semanal das turmas a que estás associado.", perfis: ["dt", "coordenador", "gestor", "admin"] },
  { href: "/horarios?vista=pessoal", titulo: "Horário de professores", descricao: "Ver as aulas de qualquer professor.", perfis: ["gestor", "admin"] },
  { href: "/admin", titulo: "Administração", descricao: "Gerir cursos, turmas, horários e contas de alunos.", perfis: ["gestor", "admin"] },
];

export function atalhosDoPerfil(perfil: Perfil): AtalhoDoPainel[] {
  return ATALHOS.filter((atalho) => atalho.perfis.includes(perfil));
}
