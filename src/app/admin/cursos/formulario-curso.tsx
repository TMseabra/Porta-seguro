"use client";

import { useActionState } from "react";
import { CampoPasskey } from "../campo-passkey";

type AcaoCurso = (
  estadoAnterior: string | undefined,
  formData: FormData,
) => Promise<string | undefined>;

interface CursoInicial {
  id: string;
  nome: string;
  sigla: string;
  anosDuracao: number;
  coordenadorId?: string;
}

export function FormularioCurso({
  acao,
  coordenadores,
  cursoInicial,
}: {
  acao: AcaoCurso;
  coordenadores: Array<{ id: string; nome: string }>;
  cursoInicial?: CursoInicial;
}) {
  const [erro, executarAcao, aEnviar] = useActionState(acao, undefined);

  return (
    <form action={executarAcao} className="empilhado">
      {cursoInicial && <input type="hidden" name="id" value={cursoInicial.id} />}

      <label className="campo">
        Nome
        <input
          name="nome"
          required
          defaultValue={cursoInicial?.nome}
        />
      </label>

      <label className="campo">
        Sigla
        <input
          name="sigla"
          required
          defaultValue={cursoInicial?.sigla}
        />
      </label>

      <label className="campo">
        Anos de duração
        <input
          name="anosDuracao"
          type="number"
          min={1}
          required
          defaultValue={cursoInicial?.anosDuracao}
        />
      </label>

      <label className="campo">
        Coordenador
        <select
          name="coordenadorId"
          defaultValue={cursoInicial?.coordenadorId ?? ""}
        >
          <option value="">— Sem coordenador —</option>
          {coordenadores.map((coordenador) => (
            <option key={coordenador.id} value={coordenador.id}>
              {coordenador.nome}
            </option>
          ))}
        </select>
      </label>

      {cursoInicial && <CampoPasskey />}

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
