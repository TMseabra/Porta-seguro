import QRCode from "qrcode";
import { headers } from "next/headers";
import { ligarBaseDados } from "@/lib/mongoose";
import { ehUserAgentDeTelemovel, EMAIL_CONTA_DE_TESTE_QR } from "@/lib/dispositivo";
import { TokenQR } from "@/models";
import type { TokenGerado } from "./qr/acoes";

export async function tokenInicialDoAluno(alunoId: string): Promise<TokenGerado | null> {
  await ligarBaseDados();
  const token = await TokenQR.findOne({ alunoId, usado: false, validoAte: { $gt: new Date() } }).lean();
  if (!token) return null;
  return {
    id: token._id.toString(),
    validoAteISO: token.validoAte.toISOString(),
    imagemDataUrl: await QRCode.toDataURL(token.token, { margin: 1, width: 240 }),
    tipo: token.tipo,
  };
}

export async function permissoesQR(email?: string | null) {
  const userAgent = (await headers()).get("user-agent");
  const ehContaDeTeste = email === EMAIL_CONTA_DE_TESTE_QR;
  return { podeGerar: ehUserAgentDeTelemovel(userAgent) || ehContaDeTeste, podeEscolherHora: ehContaDeTeste };
}
