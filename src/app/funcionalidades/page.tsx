import type { Metadata } from "next";
import { LayoutPublico, TopoPagina, CartaoPublico } from "@/components/layout-publico";

export const metadata: Metadata = { title: "Funcionalidades · PortãoSeguro" };

const FUNCIONALIDADES: { titulo: string; icone: string; texto: string }[] = [
  {
    titulo: "Código QR temporário",
    icone: "▧",
    texto: "O aluno gera o código no próprio telemóvel. Cada código vale 1 minuto, só serve uma vez e só para o movimento indicado — entrada ou saída.",
  },
  {
    titulo: "Decisões automáticas",
    icone: "◷",
    texto: "Ao ler o código, o sistema consulta o horário da turma e decide sozinho: entrada a horas, entrada com atraso, ou saída autorizada.",
  },
  {
    titulo: "Saídas antecipadas",
    icone: "⇢",
    texto: "Se um aluno menor quer sair a meio de uma aula, a saída fica pendente até o porteiro confirmar por telefone com os pais.",
  },
  {
    titulo: "Confirmação de identidade",
    icone: "◉",
    texto: "O porteiro vê a fotografia do aluno ao lado do código, para confirmar que quem o apresenta é mesmo o dono.",
  },
  {
    titulo: "Assiduidade automática",
    icone: "▥",
    texto: "Presenças, atrasos e faltas calculados a partir das entradas reais e do horário — nunca escritos à mão.",
  },
  {
    titulo: "Relatórios em PDF",
    icone: "⎙",
    texto: "Coordenadores e direção consultam a assiduidade por aluno, turma ou ano, e exportam para PDF.",
  },
  {
    titulo: "Horários por Excel",
    icone: "⊞",
    texto: "Quem faz os horários continua a trabalhar em Excel: envia o ficheiro, vê a pré-visualização e publica na turma.",
  },
  {
    titulo: "Avisos por email",
    icone: "✉",
    texto: "O aluno recebe um email a cada entrada ou saída registada, e a administração é avisada dos acessos às contas com mais permissões.",
  },
  {
    titulo: "Modo claro e escuro",
    icone: "◐",
    texto: "Todo o site funciona nos dois modos, no telemóvel e no computador.",
  },
];

const PERFIS: { perfil: string; faz: string }[] = [
  { perfil: "Aluno", faz: "Gera o código QR, vê o seu horário, a sua assiduidade e os seus movimentos." },
  { perfil: "Porteiro", faz: "Lê os códigos QR, confirma a identidade e regista entradas e saídas." },
  { perfil: "Professor", faz: "Vê apenas as suas próprias aulas." },
  { perfil: "Diretor de turma", faz: "Vê o horário da turma que dirige." },
  { perfil: "Coordenador", faz: "Consulta a assiduidade das turmas do curso que coordena." },
  { perfil: "Gestor", faz: "Gere alunos, turmas, cursos e horários — tudo o que o administrador faz, exceto o portão de testes." },
  { perfil: "Administrador", faz: "Acesso total, incluindo as ferramentas de teste e simulação." },
];

export default function PaginaFuncionalidades() {
  return (
    <LayoutPublico ativa="funcionalidades">
      <TopoPagina
        etiqueta="Funcionalidades"
        titulo="Tudo o que acontece à entrada da escola, num só sistema."
        descricao="Do código QR no telemóvel do aluno ao relatório de assiduidade da coordenação."
      />

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FUNCIONALIDADES.map((f) => (
            <CartaoPublico key={f.titulo} titulo={f.titulo} icone={f.icone}>
              {f.texto}
            </CartaoPublico>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Cada pessoa vê o que precisa</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Sete perfis, cada um só com acesso ao que é seu.</p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[.08]">
          {PERFIS.map((p) => (
            <div
              key={p.perfil}
              className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 last:border-0 sm:flex-row sm:gap-6 dark:border-white/[.08]"
            >
              <span className="w-44 shrink-0 font-semibold">{p.perfil}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{p.faz}</span>
            </div>
          ))}
        </div>
      </section>
    </LayoutPublico>
  );
}
