import type { Metadata } from "next";
import { LayoutPublico, TopoPagina, CartaoPublico } from "@/components/layout-publico";

export const metadata: Metadata = { title: "Segurança · PortãoSeguro" };

/**
 * Só descreve medidas que estão mesmo implementadas no código, e em termos
 * gerais — o objetivo é explicar o cuidado que houve, não dar a um atacante
 * pormenores de configuração.
 */
const MEDIDAS: { titulo: string; icone: string; texto: string }[] = [
  {
    titulo: "Palavras-passe protegidas",
    icone: "⚿",
    texto: "As palavras-passe nunca são guardadas: fica só uma impressão digital calculada com Argon2id, o algoritmo recomendado pela OWASP, feito de propósito para ser lento de adivinhar.",
  },
  {
    titulo: "Códigos QR impossíveis de falsificar",
    icone: "▧",
    texto: "O código não leva dados nenhuns lá dentro — é uma chave aleatória que só o servidor sabe a quem pertence. Vale 1 minuto, só uma vez, e só para entrar ou só para sair.",
  },
  {
    titulo: "Limite de tentativas de login",
    icone: "⏱",
    texto: "Depois de várias palavras-passe erradas seguidas, a conta deixa de aceitar tentativas durante algum tempo — adivinhar à força deixa de ser viável.",
  },
  {
    titulo: "Segundo fator para as contas de gestão",
    icone: "✉",
    texto: "As contas com poder sobre os dados de todos pedem, além da palavra-passe, um código de 6 dígitos enviado por email.",
  },
  {
    titulo: "Sessões com prazo",
    icone: "◷",
    texto: "As sessões expiram sozinhas. As de gestão terminam à meia-noite, para uma sessão esquecida aberta num computador da escola não ficar ativa.",
  },
  {
    titulo: "Avisos de acesso",
    icone: "⚑",
    texto: "Cada entrada numa conta com permissões elevadas gera um aviso por email com a data, a hora e de onde veio o acesso.",
  },
  {
    titulo: "Permissões verificadas no servidor",
    icone: "⛨",
    texto: "Esconder um botão não chega: cada ação é verificada no servidor. Ninguém consegue ver ou mudar dados de outra pessoa trocando um número no endereço.",
  },
  {
    titulo: "A hora decide-a o servidor",
    icone: "⌚",
    texto: "A hora de cada entrada e saída é sempre a do servidor, nunca a do telemóvel — mudar o relógio do telemóvel não muda nada.",
  },
  {
    titulo: "Proteções do browser",
    icone: "◇",
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
        etiqueta="Segurança"
        titulo="Pensado para proteger dados de menores."
        descricao="O PortãoSeguro guarda informação sobre alunos — por isso a segurança não foi um acrescento no fim, foi construída em cada parte do sistema."
      />

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MEDIDAS.map((m) => (
            <CartaoPublico key={m.titulo} titulo={m.titulo} icone={m.icone}>
              {m.texto}
            </CartaoPublico>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="rounded-2xl border border-slate-200 p-6 sm:p-8 dark:border-white/[.08] dark:bg-white/[.03]">
          <h2 className="text-2xl font-black tracking-tight">Quem vê o quê</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Cada perfil vê o mínimo necessário para fazer o seu trabalho.</p>
          <ul className="mt-6 space-y-3">
            {DADOS.map((d) => (
              <li key={d} className="flex gap-3 text-sm">
                <span className="mt-0.5 text-blue-600 dark:text-blue-400">✓</span>
                <span className="text-slate-700 dark:text-slate-300">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </LayoutPublico>
  );
}
