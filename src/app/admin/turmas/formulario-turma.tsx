"use client";

import { useActionState } from "react";
import { CampoPasskey } from "../campo-passkey";

type AcaoTurma = (
  estadoAnterior: string | undefined,
  formData: FormData,
) => Promise<string | undefined>;

interface TurmaInicial {
  id: string;
  nome: string;
  ano: number;
  cursoId: string;
  diretorTurmaId?: string;
}

export function FormularioTurma({
  acao,
  cursos,
  diretores,
  turmaInicial,
}: {
  acao: AcaoTurma;
  cursos: Array<{ id: string; nome: string }>;
  diretores: Array<{ id: string; nome: string }>;
  turmaInicial?: TurmaInicial;
}) {
  const [erro, executarAcao, aEnviar] = useActionState(acao, undefined);

  return (
    <form action={executarAcao} className="empilhado">
      {turmaInicial && <input type="hidden" name="id" value={turmaInicial.id} />}

      <label className="campo">
        Nome (ex.: 3API)
        <input
          name="nome"
          required
          defaultValue={turmaInicial?.nome}
        />
      </label>

      <label className="campo">
        Ano
        <input
          name="ano"
          type="number"
          min={1}
          required
          defaultValue={turmaInicial?.ano}
        />
      </label>

      <label className="campo">
        Curso
        <select
          name="cursoId"
          required
          defaultValue={turmaInicial?.cursoId ?? ""}
        >
          <option value="" disabled>
            — Escolhe um curso —
          </option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="campo">
        Diretor(a) de turma
        <select
          name="diretorTurmaId"
          defaultValue={turmaInicial?.diretorTurmaId ?? ""}
        >
          <option value="">— Sem diretor(a) atribuído(a) —</option>
          {diretores.map((diretor) => (
            <option key={diretor.id} value={diretor.id}>
              {diretor.nome}
            </option>
          ))}
        </select>
      </label>

      {turmaInicial && <CampoPasskey />}

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
