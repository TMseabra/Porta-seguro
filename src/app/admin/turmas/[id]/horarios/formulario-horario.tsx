"use client";

import { useActionState } from "react";
import { NOMES_DIAS_SEMANA } from "@/lib/datas";
import { CampoPasskey } from "../../../campo-passkey";

type AcaoHorario = (
  estadoAnterior: string | undefined,
  formData: FormData,
) => Promise<string | undefined>;

interface HorarioInicial {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  disciplina: string;
  professorId?: string;
  sala?: string;
}

export function FormularioHorario({
  acao,
  turmaId,
  professores,
  horarioInicial,
}: {
  acao: AcaoHorario;
  turmaId: string;
  professores: Array<{ id: string; nome: string }>;
  horarioInicial?: HorarioInicial;
}) {
  const [erro, executarAcao, aEnviar] = useActionState(acao, undefined);

  return (
    <form action={executarAcao} className="empilhado">
      <input type="hidden" name="turmaId" value={turmaId} />
      {horarioInicial && <input type="hidden" name="id" value={horarioInicial.id} />}

      <label className="campo">
        Dia da semana
        <select
          name="diaSemana"
          defaultValue={horarioInicial?.diaSemana ?? 1}
        >
          {NOMES_DIAS_SEMANA.map((nome, indice) => (
            <option key={nome} value={indice}>
              {nome}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className="campo">
          Hora de início
          <input
            name="horaInicio"
            type="time"
            required
            defaultValue={horarioInicial?.horaInicio}
          />
        </label>
        <label className="campo">
          Hora de fim
          <input
            name="horaFim"
            type="time"
            required
            defaultValue={horarioInicial?.horaFim}
          />
        </label>
      </div>

      <label className="campo">
        Disciplina
        <input
          name="disciplina"
          required
          defaultValue={horarioInicial?.disciplina}
        />
      </label>

      <label className="campo">
        Professor(a)
        <select
          name="professorId"
          defaultValue={horarioInicial?.professorId ?? ""}
        >
          <option value="">— Sem professor(a) atribuído(a) —</option>
          {professores.map((professor) => (
            <option key={professor.id} value={professor.id}>
              {professor.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="campo">
        Sala
        <input
          name="sala"
          defaultValue={horarioInicial?.sala}
        />
      </label>

      {horarioInicial && <CampoPasskey />}

      {erro && <p className="aviso aviso-vermelho">{erro}</p>}

      <button
        type="submit"
        disabled={aEnviar}
        className="botao"
      >
        {aEnviar ? "A guardar..." : "Guardar"}
      </button>
    </form>
  );
}
