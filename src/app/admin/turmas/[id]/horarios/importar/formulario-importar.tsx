"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { analisarExcel, confirmarImportacao } from "./acoes";
import type { LinhaImportada } from "@/lib/importarHorario";
import { NOMES_DIAS_SEMANA } from "@/lib/datas";

type Estado =
  | { passo: "escolher" }
  | { passo: "a-analisar" }
  | { passo: "erro"; mensagem: string }
  | { passo: "previsualizar"; linhas: LinhaImportada[] }
  | { passo: "concluido"; total: number };

export function FormularioImportar({ turmaId, turmaNome }: { turmaId: string; turmaNome: string }) {
  const [estado, setEstado] = useState<Estado>({ passo: "escolher" });
  const [passkey, setPasskey] = useState("");
  const [aEnviar, iniciarTransicao] = useTransition();
  const inputFicheiroRef = useRef<HTMLInputElement>(null);

  function analisar(evento: React.FormEvent) {
    evento.preventDefault();
    const ficheiro = inputFicheiroRef.current?.files?.[0];
    if (!ficheiro) return;

    setEstado({ passo: "a-analisar" });
    iniciarTransicao(async () => {
      const formData = new FormData();
      formData.set("ficheiro", ficheiro);
      const resultado = await analisarExcel(turmaId, formData);

      if (!resultado.ok) {
        setEstado({ passo: "erro", mensagem: resultado.erro });
        return;
      }
      setEstado({ passo: "previsualizar", linhas: resultado.linhas });
    });
  }

  function confirmar(linhas: LinhaImportada[]) {
    if (!passkey) return;
    iniciarTransicao(async () => {
      const resultado = await confirmarImportacao(turmaId, linhas, passkey);
      if (!resultado.ok) {
        setEstado({ passo: "erro", mensagem: resultado.erro });
        return;
      }
      setEstado({ passo: "concluido", total: resultado.total });
    });
  }

  if (estado.passo === "escolher" || estado.passo === "a-analisar") {
    return (
      <form onSubmit={analisar} className="cartao empilhado">
        <a href="/api/horarios/modelo" className="botao-claro self-start">
          ⬇ Descarregar modelo (.xlsx)
        </a>

        <label className="campo">
          Ficheiro Excel (.xlsx)
          <input
            ref={inputFicheiroRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
          />
        </label>

        <p className="subtitulo">
          Colunas esperadas (cabeçalho na 1.ª linha, ordem livre): Dia · Início · Fim · Disciplina · Professor ·
          Sala. &quot;Dia&quot; aceita o nome (Segunda-feira) ou o número (1). &quot;Professor&quot; é opcional,
          mas tem de ser igual ao nome de uma conta já existente.
        </p>

        <button type="submit" disabled={aEnviar} className="botao self-start">
          {aEnviar ? "A analisar..." : "Analisar ficheiro"}
        </button>
      </form>
    );
  }

  if (estado.passo === "erro") {
    return (
      <div className="empilhado">
        <p className="aviso aviso-vermelho">{estado.mensagem}</p>
        <button type="button" onClick={() => setEstado({ passo: "escolher" })} className="botao-claro self-start">
          Tentar outro ficheiro
        </button>
      </div>
    );
  }

  if (estado.passo === "concluido") {
    return (
      <div className="empilhado">
        <p className="aviso aviso-verde">
          Horário de {turmaNome} importado: {estado.total} {estado.total === 1 ? "bloco" : "blocos"}.
        </p>
        <Link href={`/admin/turmas/${turmaId}`} className="botao self-start">
          Ver a turma
        </Link>
      </div>
    );
  }

  const { linhas } = estado;
  const linhasValidas = linhas.filter((l) => l.erros.length === 0);
  const linhasComErro = linhas.filter((l) => l.erros.length > 0);

  return (
    <div className="empilhado">
      <p>
        <b>{linhasValidas.length}</b> {linhasValidas.length === 1 ? "linha válida" : "linhas válidas"}
        {linhasComErro.length > 0 && (
          <>
            {" · "}
            <b>{linhasComErro.length}</b> {linhasComErro.length === 1 ? "linha com erro" : "linhas com erro"}
          </>
        )}
      </p>

      <div className="tabela-rolavel">
        <table className="tabela">
          <thead>
            <tr>
              <th>Linha</th>
              <th>Dia</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Sala</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.numeroLinha}>
                <td>{linha.numeroLinha}</td>
                {linha.erros.length > 0 ? (
                  <td colSpan={6}>
                    <b>Erro:</b> {linha.erros.join(" ")}
                  </td>
                ) : (
                  <>
                    <td>{linha.diaSemana !== undefined ? NOMES_DIAS_SEMANA[linha.diaSemana] : "—"}</td>
                    <td>{linha.horaInicio}</td>
                    <td>{linha.horaFim}</td>
                    <td>{linha.disciplina}</td>
                    <td>{linha.professorNome ?? "—"}</td>
                    <td>{linha.sala ?? "—"}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {linhasValidas.length > 0 ? (
        <div className="aviso aviso-amarelo empilhado">
          <p>
            Isto vai <b>substituir todo o horário atual</b> de {turmaNome} pelas {linhasValidas.length} linhas
            válidas acima{linhasComErro.length > 0 ? " (as linhas com erro ficam de fora)" : ""}.
          </p>
          <label className="campo">
            Palavra-chave de confirmação
            <input
              type="password"
              value={passkey}
              onChange={(evento) => setPasskey(evento.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => confirmar(linhas)} disabled={aEnviar || !passkey} className="botao">
              {aEnviar ? "A importar..." : "Confirmar importação"}
            </button>
            <button type="button" onClick={() => setEstado({ passo: "escolher" })} className="botao-claro">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setEstado({ passo: "escolher" })} className="botao-claro self-start">
          Nenhuma linha válida — tentar outro ficheiro
        </button>
      )}
    </div>
  );
}
