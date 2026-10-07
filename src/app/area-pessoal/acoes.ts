"use server";

/**
 * Geração do código QR dinâmico (RF15), na área pessoal do aluno.
 */

import crypto from "node:crypto";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { ligarBaseDados } from "@/lib/mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { formatarHora, formatarDataHora, horaLisboaParaUtc } from "@/lib/datas";
import { ehUserAgentDeTelemovel, EMAIL_CONTA_DE_TESTE_QR } from "@/lib/dispositivo";
import { TokenQR, Registo, Ocorrencia } from "@/models";
import { proximoTipoRegisto } from "@/lib/regras";
import type { TipoRegisto } from "@/lib/constantes";

/** Validade do código (RF15): 1 minuto. */
const VALIDADE_MS = 1 * 60 * 1000;

export interface TokenGerado {
  id: string;
  validoAteISO: string;
  imagemDataUrl: string;
  /** Direção do código, mostrada ao aluno: só serve para entrar OU só para sair. */
  tipo: TipoRegisto;
  /** Só na conta de teste, quando simula uma hora: avisa que não é um código real. */
  momentoSimuladoFormatado?: string;
}

export type ResultadoGeracaoQR =
  | { ok: true; token: TokenGerado }
  | { ok: false; erro: string };

/**
 * Gera um código novo e anula os anteriores por usar (só há um válido por aluno).
 * A direção fica decidida aqui (alternância com o último registo) e a leitura exige-a (validarTokenQR).
 * Só no telemóvel: o código é para mostrar na portaria, não para gerar num PC e reencaminhar. Verifica-se
 * no servidor (esconder o botão não chega) e a conta de teste 5802@eclisboa.net fica isenta, para
 * demonstrar sem telemóvel. Essa conta pode ainda simular a data/hora (a validade continua real) e
 * escolher a direção (`tipoEscolhido`), mas só numa simulação: um código real nunca tem a direção
 * escolhida à mão.
 */
export async function gerarNovoTokenQR(
  dataSimulada?: string,
  horaSimulada?: string,
  tipoEscolhido?: string,
): Promise<ResultadoGeracaoQR> {
  const sessao = await exigirPerfil(["aluno"]);
  const ehContaDeTeste = sessao.user.email === EMAIL_CONTA_DE_TESTE_QR;

  const userAgent = (await headers()).get("user-agent");
  if (!ehUserAgentDeTelemovel(userAgent) && !ehContaDeTeste) {
    return {
      ok: false,
      erro: "Este código só pode ser gerado a partir do telemóvel. Abre a tua área pessoal no telemóvel para gerares o código QR.",
    };
  }

  const momentoSimulado =
    ehContaDeTeste && dataSimulada && horaSimulada
      ? converterParaMomento(dataSimulada, horaSimulada)
      : null;

  await ligarBaseDados();

  // A direção usa o último registo ANTES do momento a usar (real ou simulado); sem isto, uma hora
  // simulada no passado olhava ao registo mais recente de sempre.
  const momentoParaDecisao = momentoSimulado ?? new Date();
  const [, ultimoRegisto] = await Promise.all([
    TokenQR.updateMany(
      { alunoId: sessao.user.id, usado: false },
      { usado: true, usadoEm: new Date() },
    ),
    Registo.findOne({ alunoId: sessao.user.id, dataHora: { $lt: momentoParaDecisao } })
      .sort({ dataHora: -1 })
      .lean(),
  ]);
  // O valor vem do browser: só se aceita "entrada"/"saida", e só na conta de teste numa simulação.
  const tipoForcado: TipoRegisto | undefined =
    momentoSimulado && (tipoEscolhido === "entrada" || tipoEscolhido === "saida")
      ? tipoEscolhido
      : undefined;
  const tipo = tipoForcado ?? proximoTipoRegisto(ultimoRegisto?.tipo);

  // Aleatório: não dá para adivinhar o código de outro aluno.
  const token = crypto.randomBytes(24).toString("base64url");
  const criadoEm = new Date();
  const validoAte = new Date(criadoEm.getTime() + VALIDADE_MS);

  const tokenQR = await TokenQR.create({
    alunoId: sessao.user.id,
    token,
    criadoEm,
    validoAte,
    tipo,
    momentoSimulado: momentoSimulado ?? undefined,
    tipoEscolhido: tipoForcado ? true : undefined,
  });

  const imagemDataUrl = await QRCode.toDataURL(token, { margin: 1, width: 240 });

  return {
    ok: true,
    token: {
      id: tokenQR._id.toString(),
      validoAteISO: validoAte.toISOString(),
      imagemDataUrl,
      tipo,
      momentoSimuladoFormatado: momentoSimulado ? formatarDataHora(momentoSimulado) : undefined,
    },
  };
}

function converterParaMomento(data: string, hora: string): Date | null {
  const encaixeData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const encaixeHora = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!encaixeData || !encaixeHora) return null;

  const [, ano, mes, dia] = encaixeData;
  const [, horas, minutos] = encaixeHora;
  return horaLisboaParaUtc(Number(ano), Number(mes), Number(dia), Number(horas), Number(minutos));
}

export type EstadoTokenQR =
  | { usado: false }
  | {
      usado: true;
      resultado: "aceite" | "recusado" | "pendente" | "identidade_rejeitada";
      motivo?: string;
      horaFormatada?: string;
    };

/**
 * Diz ao telemóvel do aluno o que aconteceu ao seu código, para o QR já usado deixar de aparecer
 * no ecrã. Consultado em intervalos curtos pelo GeradorQR.
 */
export async function consultarEstadoTokenQR(idToken: string): Promise<EstadoTokenQR> {
  const sessao = await exigirPerfil(["aluno"]);
  await ligarBaseDados();

  // Filtra também por alunoId: ninguém espreita o estado do código de outro aluno a adivinhar o id.
  const tokenQR = await TokenQR.findOne({ _id: idToken, alunoId: sessao.user.id }).lean();
  if (!tokenQR || !tokenQR.usado) {
    return { usado: false };
  }

  // O código fica "usado" quando é lido ou fica obsoleto por outro movimento. Uma rejeição por direção
  // errada não o gasta (tal como "aluno diferente" e "expirado"): só se gasta quando é aceite.
  // Também não se dá logo por terminado: o porteiro ainda pode ter de confirmar a identidade (RF16)
  // ou ligar aos pais.
  const desde = tokenQR.usadoEm ?? tokenQR.validoAte;
  const [ocorrenciaRejeitada, registo] = await Promise.all([
    Ocorrencia.findOne({
      alunoId: sessao.user.id,
      tipo: "qr_aluno_diferente",
      dataHora: { $gte: desde },
    }).lean(),
    Registo.findOne({ alunoId: sessao.user.id, dataHora: { $gte: desde } })
      .sort({ dataHora: 1 })
      .lean(),
  ]);

  if (ocorrenciaRejeitada) {
    return { usado: true, resultado: "identidade_rejeitada" };
  }

  if (registo) {
    const aceite = registo.estado === "autorizado" || registo.estado === "confirmado_pais";
    return {
      usado: true,
      resultado: aceite ? "aceite" : "recusado",
      motivo: registo.motivo,
      horaFormatada: formatarHora(registo.dataHora),
    };
  }

  // Usado mas sem registo nem rejeição: o porteiro está a meio do fluxo (ex.: a ligar aos pais).
  return { usado: true, resultado: "pendente" };
}
