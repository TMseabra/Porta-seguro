import type { Metadata } from "next";
import { LayoutPublico, TopoPagina, CartaoPublico } from "@/components/layout-publico";

export const metadata: Metadata = { title: "Segurança · PortãoSeguro" };

/** Só medidas realmente implementadas, em termos gerais, sem dar pormenores a um atacante. */
const MEDIDAS: { titulo: string; texto: string }[] = [
  {
    titulo: "Palavras-passe protegidas",
    texto: "As palavras-passe nunca são guardadas: fica só uma impressão digital calculada com Argon2id, o algoritmo recomendado pela OWASP, feito de propósito para ser lento de adivinhar.",
  },
  {
    titulo: "Códigos QR impossíveis de falsificar",
    texto: "O código não leva dados nenhuns lá dentro — é uma chave aleatória que só o servidor sabe a quem pertence. Vale 1 minuto, só uma vez, e só para entrar ou só para sair.",
  },
  {
    titulo: "Limite de tentativas de login",
    texto: "Depois de várias palavras-passe erradas seguidas, a conta deixa de aceitar tentativas durante algum tempo — adivinhar à força deixa de ser viável.",
  },
  {
    titulo: "Segundo fator para as contas de gestão",
    texto: "As contas com poder sobre os dados de todos pedem, além da palavra-passe, um código de 6 dígitos enviado por email.",
  },
  {
    titulo: "Sessões com prazo",
    texto: "As sessões expiram sozinhas. As de gestão terminam à meia-noite, para uma sessão esquecida aberta num computador da escola não ficar ativa.",
  },
  {
    titulo: "Avisos de acesso",
    texto: "Cada entrada numa conta com permissões elevadas gera um aviso por email com a data, a hora e de onde veio o acesso.",
  },
  {
    titulo: "Permissões verificadas no servidor",
    texto: "Esconder um botão não chega: cada ação é verificada no servidor. Ninguém consegue ver ou mudar dados de outra pessoa trocando um número no endereço.",
  },
  {
    titulo: "A hora decide-a o servidor",
    texto: "A hora de cada entrada e saída é sempre a do servidor, nunca a do telemóvel — mudar o relógio do telemóvel não muda nada.",
  },
  {
    titulo: "Proteções do browser",
    texto: "O site diz ao browser de onde pode carregar conteúdo (Content-Security-Policy), só funciona por HTTPS e não pode ser embutido noutros sites.",
  },
];

const DADOS: string[] = [
  "Cada aluno só vê os seus próprios dados — o horário, a assiduidade e os movimentos dele.",
  "O porteiro identifica quem passa, mas não tem acesso ao histórico de faltas de ninguém.",
  "Um professor vê as suas aulas, não as de outros professores.",
  "O coordenador só vê as turmas do curso que coordena.",
  "Os registos de teste e simulação ficam marcados à parte e nunca contam para a assiduidade real.",
];

export default function PaginaSeguranca() {
  return (
    <LayoutPublico ativa="seguranca">
      <TopoPagina
        titulo="Segurança"
        descricao="O PortãoSeguro guarda informação sobre alunos, por isso a segurança foi construída em cada parte do sistema."
      />

      <div className="grelha sec">
        {MEDIDAS.map((m) => (
          <CartaoPublico key={m.titulo} titulo={m.titulo}>
            {m.texto}
          </CartaoPublico>
        ))}
      </div>

      <section className="sec">
        <h2>Quem vê o quê</h2>
        <ul className="lista">
          {DADOS.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>
    </LayoutPublico>
  );
}
