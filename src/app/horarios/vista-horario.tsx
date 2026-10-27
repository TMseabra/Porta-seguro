"use client";

import { useState } from "react";
import { HorarioSemanal, type BlocoHorario } from "@/components/horario-semanal";
import { SeletorTurma, type TurmaComHorario } from "./seletor-turma";

export interface ProfessorComHorario {
  id: string;
  nome: string;
  blocos: BlocoHorario[];
}

/** Professor vê só as SUAS aulas; admin e gestor alternam entre por turma e por professor; os outros só por turma. */
export function VistaHorario({
  turmas,
  meuHorario,
  professores,
  vistaInicial,
}: {
  turmas: TurmaComHorario[];
  meuHorario?: BlocoHorario[];
  professores?: ProfessorComHorario[];
  /** Vista inicial, vinda do atalho do Painel. */
  vistaInicial?: "turma" | "pessoal";
}) {
  if (meuHorario) {
    return (
      <section className="cartao">
        <h2>As minhas aulas</h2>
        <HorarioSemanal blocos={meuHorario} mostrarTurma />
      </section>
    );
  }

  if (professores) {
    return <VistaAdmin turmas={turmas} professores={professores} vistaInicial={vistaInicial} />;
  }

  return <SeletorTurma turmas={turmas} />;
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
  const [idProfessor, setIdProfessor] = useState(professores[0]?.id ?? "");
  const professor = professores.find((p) => p.id === idProfessor);

  return (
    <div className="empilhado">
      <label className="campo" style={{ maxWidth: "16rem" }}>
        Ver horário
        <select value={vista} onChange={(evento) => setVista(evento.target.value as "turma" | "pessoal")}>
          <option value="turma">Por turma</option>
          <option value="pessoal">Por professor</option>
        </select>
      </label>

      {vista === "turma" && <SeletorTurma turmas={turmas} />}

      {vista === "pessoal" && (
        <>
          <label className="campo" style={{ maxWidth: "16rem" }}>
            Professor
            <select value={idProfessor} onChange={(evento) => setIdProfessor(evento.target.value)}>
              {professores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>

          {professor && (
            <section className="cartao">
              <h2>{professor.nome}</h2>
              <HorarioSemanal blocos={professor.blocos} mostrarTurma />
            </section>
          )}
        </>
      )}
    </div>
  );
}
