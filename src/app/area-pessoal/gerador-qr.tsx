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
  compacto = false,
}: {
  tokenInicial: TokenGerado | null;
  /** Falso em PC (RF15: o código é para o telemóvel), exceto na conta de teste. */
  podeGerar: boolean;
  /** Só na conta de teste: data/hora que a portaria usa em vez da real. */
  podeEscolherHora: boolean;
  compacto?: boolean;
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
    <div className="flex flex-col items-center gap-4">
      {mostrarImagem && (
        <>
          <RotuloDirecao tipo={token.tipo} />
          {token.momentoSimuladoFormatado && (
            <p className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Simulado para {token.momentoSimuladoFormatado}
            </p>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- imagem gerada localmente (data URL), não faz sentido otimizar com next/image */}
          <img
            src={token.imagemDataUrl}
            alt="Código QR para a portaria"
            width={compacto ? 160 : 240}
            height={compacto ? 160 : 240}
            className={`hover-highlight rounded-xl border border-slate-200 p-2 dark:border-slate-700 ${compacto ? "h-36 w-36" : ""}`}
          />
          <p className="rounded-full bg-blue-50 px-3 py-1 font-mono text-sm tabular-nums text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            Válido por mais {Math.floor(segundos / 60)}:{String(segundos % 60).padStart(2, "0")}
          </p>
        </>
      )}

      {podeEscolherHora && !mostrarImagem && (
        <div className="flex w-full max-w-xs flex-col gap-2 rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm dark:border-purple-900 dark:bg-purple-950/40">
          <label className="flex items-center gap-2 font-medium text-purple-900 dark:text-purple-200">
            <input
              type="checkbox"
              checked={simularHora}
              onChange={(evento) => setSimularHora(evento.target.checked)}
            />
            Simular outra data/hora
          </label>
          {simularHora && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  value={dataSimulada}
                  onChange={(evento) =>
                    setDataHoraSimulada((atual) => ({ ...atual, data: evento.target.value }))
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  type="time"
                  value={horaSimulada}
                  onChange={(evento) =>
                    setDataHoraSimulada((atual) => ({ ...atual, hora: evento.target.value }))
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <EscolhaTipoPassagem valor={tipoSimulado} onAlterar={setTipoSimulado} />
            </div>
          )}
        </div>
      )}

      {estado.usado && <ResultadoLeitura estado={estado} tipo={token?.tipo} />}

      {expirado && (
        <p className="text-sm text-red-600 dark:text-red-400">Este código expirou.</p>
      )}

      {erro && (
        <p className="max-w-xs text-center text-sm text-red-600 dark:text-red-400">{erro}</p>
      )}

      {podeGerar ? (
        <button
          type="button"
          onClick={gerar}
          disabled={aGerar}
          className="hover-highlight rounded-lg border border-transparent bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {aGerar ? "A gerar..." : token ? "Gerar novo código" : "Gerar código QR"}
        </button>
      ) : (
        !mostrarImagem && (
          <p className="max-w-xs text-center text-sm text-slate-500 dark:text-slate-400">
            Este código só pode ser gerado a partir do telemóvel. Abre a tua
            área pessoal no telemóvel para gerares o código QR.
          </p>
        )
      )}
    </div>
  );
}

function RotuloDirecao({ tipo }: { tipo: TipoRegisto }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        tipo === "entrada"
          ? "bg-blue-700 text-white"
          : "bg-slate-700 text-white dark:bg-slate-600"
      }`}
    >
      Só serve para {tipo === "entrada" ? "entrar" : "sair"}
    </span>
  );
}

function ResultadoLeitura({
  estado,
  tipo,
}: {
  estado: Extract<EstadoTokenQR, { usado: true }>;
  tipo?: TipoRegisto;
}) {
  const estilos = {
    aceite:
      "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    recusado: "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
    pendente: "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
    identidade_rejeitada:
      "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  } as const;

  const nomeMovimento = tipo === "saida" ? "Saída" : "Entrada";
  const titulos = {
    aceite: `${nomeMovimento} autorizada`,
    recusado: "Não autorizado",
    pendente: "A aguardar confirmação na portaria",
    identidade_rejeitada: "O porteiro não confirmou a tua identidade",
  } as const;

  return (
    <div
      role="status"
      className={`w-full max-w-xs rounded-xl border-l-4 p-4 text-center text-sm ${estilos[estado.resultado]}`}
    >
      <p className="font-semibold">
        Código utilizado{estado.horaFormatada ? ` às ${estado.horaFormatada}` : ""}
      </p>
      <p className="mt-1">{titulos[estado.resultado]}</p>
      {estado.motivo && <p className="mt-1 text-xs opacity-80">{estado.motivo}</p>}
    </div>
  );
}
