import type { Metadata } from "next";
import { LayoutPublico, TopoPagina, CartaoPublico } from "@/components/layout-publico";

export const metadata: Metadata = { title: "Sobre o projeto · PortãoSeguro" };

const PASSOS: { titulo: string; texto: string }[] = [
  { titulo: "O aluno gera o código", texto: "Na sua área, no telemóvel, carrega em \"Gerar código QR\". O código vale 1 minuto." },
  { titulo: "O porteiro lê-o", texto: "Com a câmara, no ecrã da portaria. Confirma pela fotografia que é mesmo aquele aluno." },
  { titulo: "O sistema decide", texto: "Consulta o horário da turma e regista a entrada ou a saída — a horas, com atraso, ou a precisar de autorização dos pais." },
];

const TECNOLOGIAS: [string, string][] = [
  ["Next.js + React", "O site e a lógica do servidor"],
  ["TypeScript", "JavaScript com tipos, para apanhar erros antes de o site correr"],
  ["MongoDB Atlas", "A base de dados, na cloud"],
  ["Auth.js", "Login com email e palavra-passe ou conta Google"],
  ["Argon2id", "Proteção das palavras-passe"],
  ["Tailwind CSS", "O aspeto visual, com modo claro e escuro"],
  ["Vitest", "Testes automáticos das regras de entrada e saída"],
  ["Vercel", "Onde o site está publicado"],
];

export default function PaginaSobre() {
  return (
    <LayoutPublico ativa="sobre">
      <TopoPagina
        titulo="Sobre o projeto"
        descricao="O PortãoSeguro é o projeto final da UFCD 10790 — Projeto de Programação, do 3.º ano de um curso profissional de programação."
      />

      <section className="sec">
        <h2>O problema</h2>
        <p className="max-w-3xl">
          Numa escola, saber quem entrou, quem saiu e a que horas costuma depender de papel ou da memória
          de quem está na portaria. O PortãoSeguro regista cada passagem no momento, cruza-a com o horário
          da turma e calcula a assiduidade a partir desses registos, sem ninguém a escrever à mão.
        </p>
      </section>

      <section className="sec">
        <h2>Como funciona</h2>
        <ol className="lista" style={{ listStyle: "decimal" }}>
          {PASSOS.map((passo) => (
            <li key={passo.titulo}>
              <b>{passo.titulo}.</b> {passo.texto}
            </li>
          ))}
        </ol>
      </section>

      <section className="sec">
        <h2>Tecnologias</h2>
        <div className="grelha">
          {TECNOLOGIAS.map(([nome, para]) => (
            <CartaoPublico key={nome} titulo={nome}>
              {para}
            </CartaoPublico>
          ))}
        </div>
      </section>
    </LayoutPublico>
  );
}
