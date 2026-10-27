import type { Metadata } from "next";
import { LayoutPublico, TopoPagina, CartaoPublico } from "@/components/layout-publico";

export const metadata: Metadata = { title: "Funcionalidades · PortãoSeguro" };

const FUNCIONALIDADES: { titulo: string; texto: string }[] = [
  {
    titulo: "Código QR temporário",
    texto: "O aluno gera o código no próprio telemóvel. Cada código vale 1 minuto, só serve uma vez e só para o movimento indicado — entrada ou saída.",
  },
  {
    titulo: "Decisões automáticas",
    texto: "Ao ler o código, o sistema consulta o horário da turma e decide sozinho: entrada a horas, entrada com atraso, ou saída autorizada.",
  },
  {
    titulo: "Saídas antecipadas",
    texto: "Se um aluno menor quer sair a meio de uma aula, a saída fica pendente até o porteiro confirmar por telefone com os pais.",
  },
  {
    titulo: "Confirmação de identidade",
    texto: "O porteiro vê a fotografia do aluno ao lado do código, para confirmar que quem o apresenta é mesmo o dono.",
  },
  {
    titulo: "Assiduidade automática",
    texto: "Presenças, atrasos e faltas calculados a partir das entradas reais e do horário — nunca escritos à mão.",
  },
  {
    titulo: "Relatórios em PDF",
    texto: "Coordenadores e direção consultam a assiduidade por aluno, turma ou ano, e exportam para PDF.",
  },
  {
    titulo: "Horários por Excel",
    texto: "Quem faz os horários continua a trabalhar em Excel: envia o ficheiro, vê a pré-visualização e publica na turma.",
  },
  {
    titulo: "Avisos por email",
    texto: "O aluno recebe um email a cada entrada ou saída registada, e a administração é avisada dos acessos às contas com mais permissões.",
  },
  {
    titulo: "Modo claro e escuro",
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
        titulo="Funcionalidades"
        descricao="Do código QR no telemóvel do aluno ao relatório de assiduidade da coordenação."
      />

      <div className="grelha sec">
        {FUNCIONALIDADES.map((f) => (
          <CartaoPublico key={f.titulo} titulo={f.titulo}>
            {f.texto}
          </CartaoPublico>
        ))}
      </div>

      <section className="sec">
        <h2>Cada pessoa vê o que precisa</h2>
        <div className="tabela-rolavel">
          <table className="tabela">
            <tbody>
              {PERFIS.map((p) => (
                <tr key={p.perfil}>
                  <th>{p.perfil}</th>
                  <td>{p.faz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LayoutPublico>
  );
}
