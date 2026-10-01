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
        etiqueta="Sobre o projeto"
        titulo="Um projeto escolar sobre um problema real."
        descricao="O PortãoSeguro é o projeto final da UFCD 10790 — Projeto de Programação, do 3.º ano de um curso profissional de programação."
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight">O problema</h2>
          <div className="mt-4 space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              Numa escola, saber quem entrou, quem saiu e a que horas costuma depender de papel ou
              da memória de quem está na portaria. Daí é difícil saber se um aluno chegou atrasado,
              se faltou, ou se podia mesmo sair a meio de uma aula.
            </p>
            <p>
              O PortãoSeguro regista cada passagem no momento, cruza-a com o horário da turma, e
              calcula a assiduidade a partir desses registos — sem ninguém ter de a escrever à mão.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Como funciona</h2>
          <ol className="mt-4 space-y-4">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold">{passo.titulo}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{passo.texto}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <h2 className="text-2xl font-black tracking-tight">Tecnologias</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TECNOLOGIAS.map(([nome, para]) => (
            <CartaoPublico key={nome} titulo={nome}>
              {para}
            </CartaoPublico>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="rounded-2xl border border-slate-200 p-6 sm:p-8 dark:border-white/[.08] dark:bg-white/[.03]">
          <h2 className="text-2xl font-black tracking-tight">Como foi feito</h2>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
            Começou com a análise — requisitos, casos de uso e modelo de dados — e foi construído por
            fases, cada uma testada antes de avançar. As regras que decidem entradas, saídas e atrasos
            têm testes automáticos para os casos-limite, como a hora exata em que uma aula começa ou
            os dias em que muda a hora.
          </p>
        </div>
      </section>
    </LayoutPublico>
  );
}
