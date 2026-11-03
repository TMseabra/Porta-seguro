"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { ligarBaseDados } from "@/lib/mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { formatarHora, formatarDataHora, horaLisboaParaUtc } from "@/lib/datas";
import { ehUserAgentDeTelemovel, EMAIL_CONTA_DE_TESTE_QR } from "@/lib/dispositivo";
import { TokenQR, Registo, Ocorrencia } from "@/models";
import { proximoTipoRegisto, limiteDeCodigosQR, MAX_CODIGOS_POR_MINUTO } from "@/lib/regras";
import type { TipoRegisto } from "@/lib/constantes";

const VALIDADE_MS = 1 * 60 * 1000;

export interface TokenGerado {
  id: string;
  validoAteISO: string;
  imagemDataUrl: string;
  tipo: TipoRegisto;
  momentoSimuladoFormatado?: string;
}

export type ResultadoGeracaoQR =
  | { ok: true; token: TokenGerado }
  | { ok: false; erro: string };

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

  const agora = new Date();
  const recentes = await TokenQR.find({
    alunoId: sessao.user.id,
    criadoEm: { $gte: new Date(agora.getTime() - 60 * 1000) },
  })
    .select("criadoEm")
    .lean();
  const limite = limiteDeCodigosQR(
    recentes.map((codigo) => codigo.criadoEm),
    agora,
  );
  if (!limite.permitido) {
    return {
      ok: false,
      erro: `Já geraste ${MAX_CODIGOS_POR_MINUTO} códigos no último minuto. Tenta outra vez daqui a ${limite.esperarSegundos} s.`,
    };
  }

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
  const tipoForcado: TipoRegisto | undefined =
    momentoSimulado && (tipoEscolhido === "entrada" || tipoEscolhido === "saida")
      ? tipoEscolhido
      : undefined;
  const tipo = tipoForcado ?? proximoTipoRegisto(ultimoRegisto?.tipo);

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

export async function consultarEstadoTokenQR(idToken: string): Promise<EstadoTokenQR> {
  const sessao = await exigirPerfil(["aluno"]);
  await ligarBaseDados();

  const tokenQR = await TokenQR.findOne({ _id: idToken, alunoId: sessao.user.id }).lean();
  if (!tokenQR || !tokenQR.usado) {
    return { usado: false };
  }

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

  return { usado: true, resultado: "pendente" };
}
