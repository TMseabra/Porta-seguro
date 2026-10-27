"use client";

import { useState } from "react";
import { HorarioSemanal, type BlocoHorario } from "@/components/horario-semanal";

export interface TurmaComHorario {
  id: string;
  nome: string;
  ano: number;
  blocos: BlocoHorario[];
}

/** Escolhe a turma e mostra o horário dela. Os dados já vêm do servidor: trocar de turma não vai à rede. */
export function SeletorTurma({ turmas }: { turmas: TurmaComHorario[] }) {
  const [idSelecionado, setIdSelecionado] = useState(turmas[0]?.id ?? "");
  const selecionada = turmas.find((t) => t.id === idSelecionado) ?? turmas[0];

  return (
    <div className="empilhado">
      <label className="campo" style={{ maxWidth: "16rem" }}>
        Turma
        <select value={idSelecionado} onChange={(evento) => setIdSelecionado(evento.target.value)}>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      </label>

      {selecionada && (
        <section className="cartao">
          <h2>
            {selecionada.nome} ({selecionada.ano}.º ano)
          </h2>
          <HorarioSemanal blocos={selecionada.blocos} mostrarProfessor />
        </section>
      )}
    </div>
  );
}
