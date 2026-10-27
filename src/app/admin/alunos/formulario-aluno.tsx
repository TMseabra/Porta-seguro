"use client";

import { useActionState } from "react";
import { CampoPasskey } from "../campo-passkey";

type AcaoAluno = (
  estadoAnterior: string | undefined,
  formData: FormData,
) => Promise<string | undefined>;

interface AlunoInicial {
  id: string;
  nomeCompleto: string;
  email: string;
  numeroAluno?: number;
  numeroCartao?: string;
  turmaId?: string;
  maiorIdade: boolean;
  autorizacaoPais: boolean;
  suspenso: boolean;
}

export function FormularioAluno({
  acao,
  turmas,
  alunoInicial,
}: {
  acao: AcaoAluno;
  turmas: Array<{ id: string; nome: string }>;
  alunoInicial?: AlunoInicial;
}) {
  const [erro, executarAcao, aEnviar] = useActionState(acao, undefined);

  return (
    <form action={executarAcao} className="empilhado">
      {alunoInicial && <input type="hidden" name="id" value={alunoInicial.id} />}

      <label className="campo">
        Nome completo
        <input
          name="nomeCompleto"
          required
          defaultValue={alunoInicial?.nomeCompleto}
        />
      </label>

      <label className="campo">
        Email institucional
        <input
          name="email"
          type="email"
          required
          defaultValue={alunoInicial?.email}
        />
      </label>

      <label className="campo">
        {alunoInicial ? "Nova palavra-passe (deixa em branco para não alterar)" : "Palavra-passe (opcional — sem ela, só entra com conta Google)"}
        <input
          name="palavraPasse"
          type="password"
          autoComplete="new-password"
        />
      </label>

      <div className="flex gap-3">
        <label className="campo">
          Número de aluno
          <input
            name="numeroAluno"
            type="number"
            defaultValue={alunoInicial?.numeroAluno}
          />
        </label>
        <label className="campo">
          Número do cartão
          <input
            name="numeroCartao"
            defaultValue={alunoInicial?.numeroCartao}
          />
        </label>
      </div>

      <label className="campo">
        Turma
        <select
          name="turmaId"
          defaultValue={alunoInicial?.turmaId ?? ""}
        >
          <option value="">— Sem turma atribuída —</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="maiorIdade" defaultChecked={alunoInicial?.maiorIdade} />
        Maior de idade
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="autorizacaoPais"
          defaultChecked={alunoInicial?.autorizacaoPais}
         
        />
        Tem autorização dos pais para sair fora do horário
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="suspenso" defaultChecked={alunoInicial?.suspenso} />
        Suspenso (bloqueia a entrada)
      </label>

      {alunoInicial && <CampoPasskey />}

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
