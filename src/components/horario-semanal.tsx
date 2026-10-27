import { NOMES_DIAS_SEMANA } from "@/lib/datas";

export interface BlocoHorario {
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  disciplina: string;
  sala?: string;
  professor?: string;
  /** Só na vista "por professor" (RF10), onde os blocos vêm de turmas diferentes. */
  turma?: string;
}

/** Horário da semana numa tabela: segunda a domingo, e dentro de cada dia por hora de início. */
export function HorarioSemanal({
  blocos,
  mostrarProfessor = false,
  mostrarTurma = false,
}: {
  blocos: BlocoHorario[];
  mostrarProfessor?: boolean;
  mostrarTurma?: boolean;
}) {
  // 0 = domingo: passa para o fim para a semana começar à segunda.
  const ordemDia = (dia: number) => (dia === 0 ? 7 : dia);
  const ordenados = [...blocos].sort(
    (a, b) => ordemDia(a.diaSemana) - ordemDia(b.diaSemana) || a.horaInicio.localeCompare(b.horaInicio),
  );

  if (ordenados.length === 0) return <p className="subtitulo">Sem aulas no horário.</p>;

  return (
    <div className="tabela-rolavel">
      <table className="tabela">
        <thead>
          <tr>
            <th>Dia</th>
            <th>Hora</th>
            <th>Disciplina</th>
            {mostrarTurma && <th>Turma</th>}
            {mostrarProfessor && <th>Professor(a)</th>}
            <th>Sala</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.map((bloco, indice) => (
            <tr key={indice}>
              <td>{NOMES_DIAS_SEMANA[bloco.diaSemana]}</td>
              <td>
                {bloco.horaInicio}–{bloco.horaFim}
              </td>
              <td>{bloco.disciplina}</td>
              {mostrarTurma && <td>{bloco.turma ?? "—"}</td>}
              {mostrarProfessor && <td>{bloco.professor ?? "—"}</td>}
              <td>{bloco.sala ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
