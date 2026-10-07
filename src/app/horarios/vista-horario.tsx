"use client";

import { useState } from "react";
import { HorarioSemanal, type BlocoHorario } from "@/components/horario-semanal";
import { SeletorTurma, type TurmaComHorario } from "./seletor-turma";

export interface ProfessorComHorario {
  id: string;
  nome: string;
  blocos: BlocoHorario[];
}

/** Professor vê só as SUAS aulas; admin alterna entre por turma e por professor; coordenador/dt só por turma. */
export function VistaHorario({
  turmas,
  meuHorario,
  professores,
  vistaInicial,
}: {
  turmas: TurmaComHorario[];
  meuHorario?: BlocoHorario[];
  professores?: ProfessorComHorario[];
  /** Aba inicial (só admin), vinda do atalho do Painel. */
  vistaInicial?: "turma" | "pessoal";
}) {
  if (meuHorario) {
    return <MeuHorario blocos={meuHorario} />;
  }

  if (professores) {
    return <VistaAdmin turmas={turmas} professores={professores} vistaInicial={vistaInicial} />;
  }

  return <SeletorTurma turmas={turmas} />;
}

/** Aulas de UM professor, com filtro opcional por turma; nunca o horário completo da turma. */
function MeuHorario({ blocos }: { blocos: BlocoHorario[] }) {
  const turmasComAulas = [...new Set(blocos.map((b) => b.turma).filter(Boolean))] as string[];
  const [turmaFiltro, setTurmaFiltro] = useState<string | null>(null);

  const blocosFiltrados = turmaFiltro ? blocos.filter((b) => b.turma === turmaFiltro) : blocos;

  return (
    <div className="flex flex-col gap-5">
      {turmasComAulas.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por turma">
          <BotaoFiltro ativo={turmaFiltro === null} onClick={() => setTurmaFiltro(null)} label="Todas" />
          {turmasComAulas.map((turma) => (
            <BotaoFiltro
              key={turma}
              ativo={turmaFiltro === turma}
              onClick={() => setTurmaFiltro(turma)}
              label={turma}
            />
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-semibold">As minhas aulas</h2>
        {/* `mostrarTurma` só faz sentido a ver "Todas" — filtrado a uma
         * turma, repetir o nome dela em cada bloco era só ruído. */}
        <HorarioSemanal key={turmaFiltro ?? "todas"} blocos={blocosFiltrados} mostrarTurma={!turmaFiltro} />
      </section>
    </div>
  );
}

function VistaAdmin({
  turmas,
  professores,
  vistaInicial,
}: {
  turmas: TurmaComHorario[];
  professores: ProfessorComHorario[];
  vistaInicial?: "turma" | "pessoal";
}) {
  const [vista, setVista] = useState<"turma" | "pessoal">(vistaInicial ?? "turma");
  const [idProfessorSelecionado, setIdProfessorSelecionado] = useState(professores[0]?.id ?? "");

  const professorSelecionado = professores.find((p) => p.id === idProfessorSelecionado);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Ver horário por">
        <BotaoAba ativo={vista === "turma"} onClick={() => setVista("turma")} label="Por turma" />
        <BotaoAba
          ativo={vista === "pessoal"}
          onClick={() => setVista("pessoal")}
          label="Por professor"
        />
      </div>

      {vista === "turma" && <SeletorTurma turmas={turmas} />}

      {vista === "pessoal" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Escolher professor">
            {professores.map((professor) => (
              <BotaoAba
                key={professor.id}
                ativo={professor.id === idProfessorSelecionado}
                onClick={() => setIdProfessorSelecionado(professor.id)}
                label={professor.nome}
                arredondado
              />
            ))}
          </div>

          {professorSelecionado && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 font-semibold">{professorSelecionado.nome}</h2>
              <HorarioSemanal
                key={professorSelecionado.id}
                blocos={professorSelecionado.blocos}
                mostrarTurma
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BotaoFiltro({
  ativo,
  onClick,
  label,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        ativo
          ? "border-blue-700 bg-blue-700 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-600 dark:hover:text-blue-400"
      }`}
    >
      {label}
    </button>
  );
}

function BotaoAba({
  ativo,
  onClick,
  label,
  arredondado = false,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
  arredondado?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={`border px-4 py-1.5 text-sm font-medium transition ${
        arredondado ? "rounded-full" : "rounded-lg py-2"
      } ${
        ativo
          ? "border-blue-700 bg-blue-700 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-600 dark:hover:text-blue-400"
      }`}
    >
      {label}
    </button>
  );
}
