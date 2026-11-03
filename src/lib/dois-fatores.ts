import crypto from "node:crypto";
import { ligarBaseDados } from "@/lib/mongoose";
import {
  CodigoVerificacao,
  VALIDADE_CODIGO_MINUTOS,
  MAX_TENTATIVAS_CODIGO,
} from "@/models";
import { hashPassword, verificarPassword } from "@/lib/senha";
import { enviarCodigoVerificacao, emailConfigurado } from "@/lib/notificacoes";
import type { Perfil } from "@/lib/constantes";

const PERFIS_COM_DOIS_FATORES: Perfil[] = ["gestor", "admin"];

/** Sem RESEND_API_KEY não se exige código: apagar a chave é a saída de emergência. */
export function precisaDoisFatores(perfil: Perfil): boolean {
  return PERFIS_COM_DOIS_FATORES.includes(perfil) && emailConfigurado();
}

export async function enviarNovoCodigo(nome: string, email: string): Promise<boolean> {
  await ligarBaseDados();

  const emailNormalizado = email.trim().toLowerCase();

  // randomInt e não Math.random(): é um segredo.
  const codigo = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

  await CodigoVerificacao.deleteMany({ email: emailNormalizado });
  await CodigoVerificacao.create({
    email: emailNormalizado,
    hash: await hashPassword(codigo),
    tentativas: 0,
    criadoEm: new Date(),
  });

  const enviado = await enviarCodigoVerificacao(
    nome,
    emailNormalizado,
    codigo,
    VALIDADE_CODIGO_MINUTOS,
  );

  if (!enviado) {
    await CodigoVerificacao.deleteMany({ email: emailNormalizado });
  }

  return enviado;
}

export async function confirmarCodigo(email: unknown, codigo: unknown): Promise<boolean> {
  // typeof: evita injeção NoSQL ({"$ne": null}).
  if (typeof email !== "string" || typeof codigo !== "string") return false;

  const codigoLimpo = codigo.trim();
  if (!/^\d{6}$/.test(codigoLimpo)) return false;

  await ligarBaseDados();
  const emailNormalizado = email.trim().toLowerCase();

  const guardado = await CodigoVerificacao.findOne({ email: emailNormalizado });
  if (!guardado) return false;

  const expirouEm = guardado.criadoEm.getTime() + VALIDADE_CODIGO_MINUTOS * 60 * 1000;
  if (Date.now() > expirouEm) {
    await CodigoVerificacao.deleteOne({ _id: guardado._id });
    return false;
  }

  if (guardado.tentativas >= MAX_TENTATIVAS_CODIGO) {
    await CodigoVerificacao.deleteOne({ _id: guardado._id });
    return false;
  }

  if (!(await verificarPassword(codigoLimpo, guardado.hash))) {
    await CodigoVerificacao.updateOne({ _id: guardado._id }, { $inc: { tentativas: 1 } });
    return false;
  }

  await CodigoVerificacao.deleteOne({ _id: guardado._id });
  return true;
}
