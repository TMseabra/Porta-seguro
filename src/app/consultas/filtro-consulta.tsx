"use client";

import { useState, useTransition } from "react";
import { consultarAssiduidade } from "./acoes";
import type { Ambito, ResultadoConsulta } from "./logica";

interface Opcao {
  id: string;
  nome: string;
}

const ROTULOS_SITUACAO: Record<string, string> = {
  presenca: "Presença",
  presenca_atraso: "Presença (atraso)",
  falta: "Falta",
};

export function FiltroConsulta({
  alunos,
  turmas,
  anos,
  mesInicial,
  podeExportar,
}: {
  alunos: Opcao[];
  turmas: Opcao[];
  anos: number[];
  mesInicial: string;
  podeExportar: boolean;
}) {
  const [ambito, setAmbito] = useState<Ambito>("aluno");
  const [alvo, setAlvo] = useState(alunos[0]?.id ?? "");
  const [mes, setMes] = useState(mesInicial);
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [aEnviar, iniciarTransicao] = useTransition();

  function opcoesParaAmbito(valor: Ambito): Array<{ valor: string; rotulo: string }> {
    if (valor === "aluno") return alunos.map((a) => ({ valor: a.id, rotulo: a.nome }));
    if (valor === "turma") return turmas.map((t) => ({ valor: t.id, rotulo: t.nome }));
    return anos.map((a) => ({ valor: String(a), rotulo: `${a}º ano` }));
  }

  function mudarAmbito(novo: Ambito) {
    setAmbito(novo);
    setAlvo(opcoesParaAmbito(novo)[0]?.valor ?? "");
    setResultado(null);
  }

  function consultar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    iniciarTransicao(async () => {
      const novoResultado = await consultarAssiduidade(ambito, alvo, mes);
      setResultado(novoResultado);
    });
  }

  const opcoesAtuais = opcoesParaAmbito(ambito);

  return (
    <div className="empilhado">
      <form onSubmit={consultar} className="cartao filtros">
        <label className="campo">
          Âmbito
          <select value={ambito} onChange={(e) => mudarAmbito(e.target.value as Ambito)}>
            <option value="aluno">Por aluno</option>
            <option value="turma">Por turma</option>
            <option value="ano">Por ano de formação</option>
          </select>
        </label>

        <label className="campo">
          {ambito === "aluno" ? "Aluno" : ambito === "turma" ? "Turma" : "Ano"}
          <select value={alvo} onChange={(e) => setAlvo(e.target.value)}>
            {opcoesAtuais.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          Mês
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        </label>

        <button type="submit" disabled={aEnviar || !alvo} className="botao">
          {aEnviar ? "A consultar..." : "Consultar"}
        </button>

        {podeExportar && resultado?.ok && (
          <a
            href={`/api/relatorios/pdf?ambito=${ambito}&alvo=${alvo}&mes=${mes}`}
            className="botao-claro"
          >
            Exportar PDF
          </a>
        )}
      </form>

      {resultado && !resultado.ok && <p className="aviso aviso-vermelho">{resultado.erro}</p>}

      {resultado?.ok && (
        <section className="cartao">
          <h2>{resultado.alvoNome}</h2>

          <div className="estatisticas">
            <Estatistica rotulo="Dias letivos" valor={resultado.resumo.diasLetivos} />
            <Estatistica rotulo="Presenças" valor={resultado.resumo.presencas} />
            <Estatistica rotulo="Atrasos" valor={resultado.resumo.atrasos} />
            <Estatistica rotulo="Faltas" valor={resultado.resumo.faltas} />
          </div>
          <p className="subtitulo mb-3">
            Taxa de presença: {(resultado.resumo.taxaPresenca * 100).toFixed(1)}%
          </p>

          <div className="tabela-rolavel">
            {resultado.ambito === "aluno" ? (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Dia</th>
                    <th>Situação</th>
                    <th>Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.dias.map((dia, indice) => (
                    <tr key={indice}>
                      <td>{dia.dataFormatada}</td>
                      <td>{ROTULOS_SITUACAO[dia.situacao]}</td>
                      <td>{dia.horaEntradaFormatada ?? "—"}</td>
                    </tr>
                  ))}
                  {resultado.dias.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center">
                        Sem dias letivos neste mês.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Presenças</th>
                    <th>Atrasos</th>
                    <th>Faltas</th>
                    <th>Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.alunos.map((linha) => (
                    <tr key={linha.alunoId}>
                      <td>{linha.nome}</td>
                      <td>{linha.turma ?? "—"}</td>
                      <td>{linha.resumo.presencas}</td>
                      <td>{linha.resumo.atrasos}</td>
                      <td>{linha.resumo.faltas}</td>
                      <td>{(linha.resumo.taxaPresenca * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                  {resultado.alunos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Sem alunos neste âmbito.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Estatistica({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="estatistica">
      <strong>{valor}</strong>
      <span>{rotulo}</span>
    </div>
  );
}
