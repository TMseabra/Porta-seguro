"use client";

import { useState, useTransition } from "react";
import {
  confirmarSaidaComPais,
  lerCodigoQR,
  confirmarIdentidadeQR,
} from "./acoes";
import type { AlunoResumo, LinhaRegisto, ResultadoMovimento } from "@/lib/movimento";
import type { TipoRegisto } from "@/lib/constantes";
import { LeitorQR } from "./leitor-qr";
import {
  CartaoAluno,
  EstadoPortaEHorario,
  Semaforo,
  BotaoResposta,
} from "@/components/semaforo-identificacao";

type Estado =
  | { passo: "vazio" }
  | { passo: "a-ler" }
  | { passo: "erro"; mensagem: string }
  | { passo: "resultado"; aluno: AlunoResumo; autorizado: boolean; motivo: string; tipo: TipoRegisto }
  // `idToken` é o único fio que liga os passos: quem, quando e como são
  // sempre recalculados no servidor a partir dele (ver acoes.ts).
  | { passo: "pendente"; aluno: AlunoResumo; motivo: string; idToken: string }
  | { passo: "confirmar-identidade"; aluno: AlunoResumo; idToken: string; tipo: TipoRegisto };

const ROTULOS_ESTADO: Record<string, string> = {
  autorizado: "Autorizado",
  nao_autorizado: "Não autorizado",
  confirmado_pais: "Autorizado (pais)",
};

const ROTULOS_TIPO: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
};

/** Sem espera mínima o resultado aparecia de repente e não se via que tinha havido leitura. */
const ESPERA_MINIMA_MS = 900;

export function PainelPortao({ linhasIniciais }: { linhasIniciais: LinhaRegisto[] }) {
  const [estado, setEstado] = useState<Estado>({ passo: "vazio" });
  const [linhas, setLinhas] = useState<LinhaRegisto[]>(linhasIniciais);
  const [aEnviar, iniciarTransicao] = useTransition();

  function aplicarResultadoIdentificacao(resultado: ResultadoMovimento, idToken: string) {
    if (!resultado.ok) {
      setEstado({ passo: "erro", mensagem: resultado.erro });
      return;
    }
    if (resultado.pendente) {
      setEstado({
        passo: "pendente",
        aluno: resultado.aluno,
        motivo: resultado.motivo,
        idToken,
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
    setLinhas((atuais) => [resultado.linha, ...atuais]);
  }

  function responderContactoPais(paisAutorizaram: boolean) {
    if (estado.passo !== "pendente") return;
    const { aluno, idToken } = estado;

    iniciarTransicao(async () => {
      const resultado = await confirmarSaidaComPais(idToken, paisAutorizaram);

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
      setLinhas((atuais) => [resultado.linha, ...atuais]);
    });
  }

  function aoLerTokenQR(token: string) {
    setEstado({ passo: "a-ler" });

    iniciarTransicao(async () => {
      const [resultado] = await Promise.all([
        lerCodigoQR(token),
        new Promise((resolve) => setTimeout(resolve, ESPERA_MINIMA_MS)),
      ]);

      if (!resultado.ok) {
        setEstado({ passo: "erro", mensagem: resultado.erro });
        return;
      }
      setEstado({
        passo: "confirmar-identidade",
        aluno: resultado.aluno,
        idToken: resultado.idToken,
        tipo: resultado.tipo,
      });
    });
  }

  function responderIdentidade(eEsteAluno: boolean) {
    if (estado.passo !== "confirmar-identidade") return;
    const { idToken, tipo } = estado;

    iniciarTransicao(async () => {
      const resultado = await confirmarIdentidadeQR(idToken, eEsteAluno);

      if (!resultado.ok) {
        setEstado({ passo: "erro", mensagem: resultado.erro });
        return;
      }
      if ("identidadeRejeitada" in resultado) {
        setEstado({
          passo: "resultado",
          aluno: resultado.aluno,
          autorizado: false,
          motivo: resultado.motivo,
          tipo,
        });
        return;
      }
      aplicarResultadoIdentificacao(resultado, idToken);
    });
  }

  const aLerOuVazio = estado.passo === "vazio" || estado.passo === "a-ler";

  return (
    <div className="empilhado">
      <div className="colunas">
        <section className="cartao">
          <h2>Leitura de código QR</h2>

          {estado.passo === "vazio" && (
            <div className="flex flex-col items-center gap-3">
              <LeitorQR onLido={aoLerTokenQR} />
              <p className="subtitulo text-center">Aponta a câmara ao código do telemóvel do aluno.</p>
            </div>
          )}

          {estado.passo === "a-ler" && (
            <div role="status" className="flex items-center justify-center gap-3 py-8">
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
              />
              <p className="text-sm font-bold">A ler...</p>
            </div>
          )}

          {(estado.passo === "erro" || estado.passo === "resultado") && (
            <button type="button" onClick={() => setEstado({ passo: "vazio" })} className="botao">
              Ler o próximo código
            </button>
          )}
          {(estado.passo === "confirmar-identidade" || estado.passo === "pendente") && (
            <p className="subtitulo">Responde à pergunta ao lado para continuar.</p>
          )}
        </section>

        <section className="cartao">
          <h2>Confirmar identidade</h2>

          {aLerOuVazio && <p className="subtitulo">Ainda não há nenhum código lido.</p>}

          {estado.passo === "erro" && <p className="aviso aviso-vermelho">{estado.mensagem}</p>}

          {estado.passo === "resultado" && (
            <div className="empilhado">
              <CartaoAluno aluno={estado.aluno} />
              <EstadoPortaEHorario aluno={estado.aluno} tipo={estado.tipo} />
              <Semaforo cor={estado.autorizado ? "verde" : "vermelho"}>
                <b>{estado.autorizado ? "Autorizado" : "Não autorizado"}</b> — {estado.motivo}
              </Semaforo>
            </div>
          )}

          {estado.passo === "confirmar-identidade" && (
            <div className="empilhado">
              <CartaoAluno aluno={estado.aluno} />
              <EstadoPortaEHorario aluno={estado.aluno} tipo={estado.tipo} />
              <Semaforo cor="amarelo">
                <p className="mb-2 font-bold">É esta a pessoa à tua frente?</p>
                <div className="flex gap-2">
                  <BotaoResposta onClick={() => responderIdentidade(true)} disabled={aEnviar} principal>
                    Sim
                  </BotaoResposta>
                  <BotaoResposta onClick={() => responderIdentidade(false)} disabled={aEnviar}>
                    Não é esta pessoa
                  </BotaoResposta>
                </div>
              </Semaforo>
            </div>
          )}

          {estado.passo === "pendente" && (
            <div className="empilhado">
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
        </section>
      </div>

      <section>
        <h2 className="mb-2 font-bold">Registos de hoje</h2>
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Aluno</th>
                <th>Movimento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">
                    Ainda sem registos hoje.
                  </td>
                </tr>
              )}
              {linhas.map((linha) => (
                <tr key={linha.id}>
                  <td>{linha.horaFormatada}</td>
                  <td>
                    {linha.alunoNome}
                    {linha.metodo === "simulacao" && <b> (simulação)</b>}
                  </td>
                  <td>{ROTULOS_TIPO[linha.tipo]}</td>
                  <td>{ROTULOS_ESTADO[linha.estado]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
