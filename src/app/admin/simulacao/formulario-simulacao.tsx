"use client";

import { useState, useTransition } from "react";
import { simularPassagem, confirmarSaidaSimulada } from "./acoes";
import type { AlunoResumo, ResultadoMovimento } from "@/lib/movimento";
import type { TipoRegisto } from "@/lib/constantes";
import { EscolhaTipoPassagem, type TipoEscolhido } from "@/components/escolha-tipo-passagem";
import {
  CartaoAluno,
  EstadoPortaEHorario,
  Semaforo,
  BotaoResposta,
} from "@/components/semaforo-identificacao";

export interface AlunoParaSeletor {
  id: string;
  nome: string;
  turma?: string;
}

type Estado =
  | { passo: "formulario" }
  | { passo: "erro"; mensagem: string }
  | { passo: "resultado"; aluno: AlunoResumo; autorizado: boolean; motivo: string; tipo: TipoRegisto }
  | {
      passo: "pendente";
      aluno: AlunoResumo;
      motivo: string;
      horarioId?: string;
      momentoISO: string;
    };

/** Relógio do browser, de propósito (não o fuso de Lisboa): "agora" é o de quem usa o site. */
function agoraNoBrowser(): { data: string; hora: string } {
  const agora = new Date();
  const doisDigitos = (n: number) => String(n).padStart(2, "0");
  return {
    data: `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`,
    hora: `${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}`,
  };
}

export function FormularioSimulacao({ alunos }: { alunos: AlunoParaSeletor[] }) {
  const [alunoId, setAlunoId] = useState(alunos[0]?.id ?? "");
  const [{ data, hora }, setDataHora] = useState(agoraNoBrowser);
  const [tipo, setTipo] = useState<TipoEscolhido>("auto");
  const [estado, setEstado] = useState<Estado>({ passo: "formulario" });
  const [aEnviar, iniciarTransicao] = useTransition();

  function aplicarResultado(resultado: ResultadoMovimento) {
    if (!resultado.ok) {
      setEstado({ passo: "erro", mensagem: resultado.erro });
      return;
    }
    if (resultado.pendente) {
      setEstado({
        passo: "pendente",
        aluno: resultado.aluno,
        motivo: resultado.motivo,
        horarioId: resultado.horarioId,
        momentoISO: resultado.momentoISO,
      });
      return;
    }
    setEstado({
      passo: "resultado",
      aluno: resultado.aluno,
      autorizado: resultado.autorizado,
      motivo: resultado.motivo,
      tipo: resultado.linha.tipo,
    });
  }

  function simular(evento: React.FormEvent) {
    evento.preventDefault();
    if (!alunoId) return;

    iniciarTransicao(async () => {
      const resultado = await simularPassagem(alunoId, data, hora, tipo === "auto" ? undefined : tipo);
      aplicarResultado(resultado);
    });
  }

  function responderContactoPais(paisAutorizaram: boolean) {
    if (estado.passo !== "pendente") return;
    const { aluno, horarioId, momentoISO } = estado;

    iniciarTransicao(async () => {
      const resultado = await confirmarSaidaSimulada(aluno.id, horarioId, momentoISO, paisAutorizaram);

      if (!resultado.ok) {
        setEstado({ passo: "erro", mensagem: resultado.erro });
        return;
      }

      setEstado({
        passo: "resultado",
        aluno,
        autorizado: resultado.autorizado,
        motivo: paisAutorizaram
          ? "Saída fora do horário confirmada por telefone com os pais."
          : "Pais contactados; saída não autorizada.",
        tipo: resultado.linha.tipo,
      });
    });
  }

  return (
    <div className="empilhado">
      <form onSubmit={simular} className="cartao empilhado">
        <label className="campo">
          Aluno
          <select value={alunoId} onChange={(evento) => setAlunoId(evento.target.value)}>
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.turma ? `${aluno.nome} — ${aluno.turma}` : aluno.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="filtros">
          <label className="campo">
            Dia
            <input
              type="date"
              value={data}
              onChange={(evento) => setDataHora((atual) => ({ ...atual, data: evento.target.value }))}
              required
            />
          </label>
          <label className="campo">
            Hora
            <input
              type="time"
              value={hora}
              onChange={(evento) => setDataHora((atual) => ({ ...atual, hora: evento.target.value }))}
              required
            />
          </label>
          <button type="button" onClick={() => setDataHora(agoraNoBrowser())} className="botao-claro">
            Agora
          </button>
        </div>

        <EscolhaTipoPassagem valor={tipo} onAlterar={setTipo} />

        <button type="submit" disabled={aEnviar || !alunoId} className="botao self-start">
          {aEnviar ? "A simular..." : "Simular passagem"}
        </button>
      </form>

      {estado.passo === "erro" && <p className="aviso aviso-vermelho">{estado.mensagem}</p>}

      {estado.passo === "resultado" && (
        <div className="cartao empilhado">
          <CartaoAluno aluno={estado.aluno} />
          <EstadoPortaEHorario aluno={estado.aluno} tipo={estado.tipo} />
          <Semaforo cor={estado.autorizado ? "verde" : "vermelho"}>
            <b>{estado.autorizado ? "Autorizado" : "Não autorizado"}</b> — {estado.motivo}
          </Semaforo>
        </div>
      )}

      {estado.passo === "pendente" && (
        <div className="cartao empilhado">
          <CartaoAluno aluno={estado.aluno} />
          <Semaforo cor="amarelo">
            <p className="mb-2">{estado.motivo}</p>
            <p className="mb-2 font-bold">Os pais autorizam a saída?</p>
            <div className="flex gap-2">
              <BotaoResposta onClick={() => responderContactoPais(true)} disabled={aEnviar} principal>
                Sim
              </BotaoResposta>
              <BotaoResposta onClick={() => responderContactoPais(false)} disabled={aEnviar}>
                Não
              </BotaoResposta>
            </div>
          </Semaforo>
        </div>
      )}
    </div>
  );
}
