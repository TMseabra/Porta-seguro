"use client";

import { useEffect, useState, useTransition } from "react";
import {
  gerarNovoTokenQR,
  consultarEstadoTokenQR,
  type TokenGerado,
  type EstadoTokenQR,
} from "./acoes";
import type { TipoRegisto } from "@/lib/constantes";
import { EscolhaTipoPassagem, type TipoEscolhido } from "@/components/escolha-tipo-passagem";

const INTERVALO_VERIFICACAO_MS = 2000;

function segundosRestantes(validoAteISO: string): number {
  const restam = Math.round((new Date(validoAteISO).getTime() - Date.now()) / 1000);
  return Math.max(0, restam);
}

/** Data e hora do browser, como em `/admin/simulacao`: poupa escrever à mão. */
function agoraNoBrowser(): { data: string; hora: string } {
  const agora = new Date();
  const doisDigitos = (n: number) => String(n).padStart(2, "0");
  return {
    data: `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`,
    hora: `${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}`,
  };
}

export function GeradorQR({
  tokenInicial,
  podeGerar,
  podeEscolherHora,
}: {
  tokenInicial: TokenGerado | null;
  /** Falso em PC (RF15: o código é para o telemóvel), exceto na conta de teste. */
  podeGerar: boolean;
  /** Só na conta de teste: data/hora que a portaria usa em vez da real. */
  podeEscolherHora: boolean;
}) {
  const [token, setToken] = useState<TokenGerado | null>(tokenInicial);
  const [segundos, setSegundos] = useState(() =>
    tokenInicial ? segundosRestantes(tokenInicial.validoAteISO) : 0,
  );
  const [estado, setEstado] = useState<EstadoTokenQR>({ usado: false });
  const [erro, setErro] = useState<string | null>(null);
  const [aGerar, iniciarTransicao] = useTransition();
  const [simularHora, setSimularHora] = useState(false);
  const [tipoSimulado, setTipoSimulado] = useState<TipoEscolhido>("auto");
  const [{ data: dataSimulada, hora: horaSimulada }, setDataHoraSimulada] =
    useState(agoraNoBrowser);

  // Um só intervalo atualiza a contagem e pergunta ao servidor se o código já foi lido.
  useEffect(() => {
    if (!token || estado.usado) return;

    const intervalo = setInterval(async () => {
      setSegundos(segundosRestantes(token.validoAteISO));

      const novoEstado = await consultarEstadoTokenQR(token.id);
      if (novoEstado.usado) {
        setEstado(novoEstado);
      }
    }, INTERVALO_VERIFICACAO_MS);

    return () => clearInterval(intervalo);
  }, [token, estado.usado]);

  function gerar() {
    iniciarTransicao(async () => {
      const resultado =
        podeEscolherHora && simularHora && dataSimulada && horaSimulada
          ? await gerarNovoTokenQR(dataSimulada, horaSimulada, tipoSimulado === "auto" ? undefined : tipoSimulado)
          : await gerarNovoTokenQR();
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      setErro(null);
      setToken(resultado.token);
      setSegundos(segundosRestantes(resultado.token.validoAteISO));
      setEstado({ usado: false });
    });
  }

  const expirado = token !== null && !estado.usado && segundos <= 0;
  // Depois de lido, a imagem desaparece sempre, para ninguém a mostrar a outra pessoa.
  const mostrarImagem = token && !expirado && !estado.usado;

  return (
    <div className="flex flex-col items-center gap-3">
      {mostrarImagem && (
        <>
          <b>Só serve para {token.tipo === "entrada" ? "entrar" : "sair"}</b>
          {token.momentoSimuladoFormatado && <b>(Simulado para {token.momentoSimuladoFormatado})</b>}
          {/* eslint-disable-next-line @next/next/no-img-element -- imagem gerada localmente (data URL), não faz sentido otimizar com next/image */}
          <img
            src={token.imagemDataUrl}
            alt="Código QR para a portaria"
            width={240}
            height={240}
            className="rounded-lg bg-white p-2"
          />
          <p>
            Válido por mais {Math.floor(segundos / 60)}:{String(segundos % 60).padStart(2, "0")}
          </p>
        </>
      )}

      {podeEscolherHora && !mostrarImagem && (
        <div className="aviso aviso-amarelo empilhado w-full max-w-xs">
          <label className="flex items-center gap-2 font-bold">
            <input
              type="checkbox"
              checked={simularHora}
              onChange={(evento) => setSimularHora(evento.target.checked)}
            />
            Simular outra data/hora
          </label>
          {simularHora && (
            <>
              <div className="filtros">
                <label className="campo">
                  Dia
                  <input
                    type="date"
                    value={dataSimulada}
                    onChange={(evento) => setDataHoraSimulada((atual) => ({ ...atual, data: evento.target.value }))}
                  />
                </label>
                <label className="campo">
                  Hora
                  <input
                    type="time"
                    value={horaSimulada}
                    onChange={(evento) => setDataHoraSimulada((atual) => ({ ...atual, hora: evento.target.value }))}
                  />
                </label>
              </div>
              <EscolhaTipoPassagem valor={tipoSimulado} onAlterar={setTipoSimulado} />
            </>
          )}
        </div>
      )}

      {estado.usado && <ResultadoLeitura estado={estado} tipo={token?.tipo} />}

      {expirado && <p className="aviso aviso-vermelho">Este código expirou.</p>}

      {erro && <p className="aviso aviso-vermelho max-w-xs">{erro}</p>}

      {podeGerar ? (
        <button type="button" onClick={gerar} disabled={aGerar} className="botao">
          {aGerar ? "A gerar..." : token ? "Gerar novo código" : "Gerar código QR"}
        </button>
      ) : (
        !mostrarImagem && (
          <p className="subtitulo max-w-xs text-center">
            Este código só pode ser gerado a partir do telemóvel. Abre o PortãoSeguro no telemóvel para gerares o
            código QR.
          </p>
        )
      )}
    </div>
  );
}

function ResultadoLeitura({
  estado,
  tipo,
}: {
  estado: Extract<EstadoTokenQR, { usado: true }>;
  tipo?: TipoRegisto;
}) {
  const cores = {
    aceite: "verde",
    recusado: "vermelho",
    pendente: "amarelo",
    identidade_rejeitada: "vermelho",
  } as const;

  const nomeMovimento = tipo === "saida" ? "Saída" : "Entrada";
  const titulos = {
    aceite: `${nomeMovimento} autorizada`,
    recusado: "Não autorizado",
    pendente: "A aguardar confirmação na portaria",
    identidade_rejeitada: "O porteiro não confirmou a tua identidade",
  } as const;

  return (
    <div role="status" className={`aviso aviso-${cores[estado.resultado]} w-full max-w-xs text-center`}>
      <p className="font-bold">Código utilizado{estado.horaFormatada ? ` às ${estado.horaFormatada}` : ""}</p>
      <p>{titulos[estado.resultado]}</p>
      {estado.motivo && <p className="text-xs">{estado.motivo}</p>}
    </div>
  );
}
