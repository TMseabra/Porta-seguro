/**
 * Segundo fator por email para admin e gestor: depois da palavra-passe, um código de 6 dígitos.
 * Só estas contas, porque podem mudar passwords de outros e ver os dados de todos; pedir o código
 * a todos os alunos seria só um estorvo.
 */

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

/**
 * Só para estes perfis e só se houver forma de enviar o email (RESEND_API_KEY). Sem chave, exigir um
 * código que nunca sairia trancava a administração: apagar a chave é a saída de emergência.
 */
export function precisaDoisFatores(perfil: Perfil): boolean {
  return PERFIS_COM_DOIS_FATORES.includes(perfil) && emailConfigurado();
}

/** Cria um código, guarda o hash e envia-o. Devolve false se o email não saiu (o login é recusado). */
export async function enviarNovoCodigo(nome: string, email: string): Promise<boolean> {
  await ligarBaseDados();

  const emailNormalizado = email.trim().toLowerCase();

  // randomInt e não Math.random(): é um segredo, e Math.random() é previsível.
  const codigo = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

  // Um código de cada vez: pedir outro invalida o anterior, senão cada pedido dava mais
  // hipóteses a quem estivesse a adivinhar.
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

  // Email não saiu: apaga o código, para não ficar um válido que ninguém recebeu.
  if (!enviado) {
    await CodigoVerificacao.deleteMany({ email: emailNormalizado });
  }

  return enviado;
}

/** Só devolve true uma vez: acertar apaga o código; errar gasta uma das 3 tentativas. */
export async function confirmarCodigo(email: unknown, codigo: unknown): Promise<boolean> {
  // typeof: sem isto, um objeto ({"$ne": null}) entrava como operador na consulta (injeção NoSQL).
  if (typeof email !== "string" || typeof codigo !== "string") return false;

  const codigoLimpo = codigo.trim();
  if (!/^\d{6}$/.test(codigoLimpo)) return false;

  await ligarBaseDados();
  const emailNormalizado = email.trim().toLowerCase();

  const guardado = await CodigoVerificacao.findOne({ email: emailNormalizado });
  if (!guardado) return false;

  // O índice TTL só corre de minuto a minuto, por isso a validade confirma-se aqui.
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
