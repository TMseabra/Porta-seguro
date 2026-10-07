/** Login por email + palavra-passe, separado do auth.ts para se poder testar sem simular um pedido ao Auth.js. */

import { ligarBaseDados } from "@/lib/mongoose";
import { Utilizador, TentativaLogin, MAX_TENTATIVAS, JANELA_MINUTOS } from "@/models";
import { verificarPassword } from "@/lib/senha";
import { precisaDoisFatores, confirmarCodigo } from "@/lib/dois-fatores";
import type { Perfil } from "@/lib/constantes";

export interface UtilizadorAutenticado {
  id: string;
  email: string;
  name: string;
  perfil: Perfil;
}

/**
 * Verifica email + palavra-passe, sem o 2FA. Existe à parte porque o ecrã de login precisa dela no 1.º passo:
 * só depois de confirmar a palavra-passe se envia o código (senão qualquer pessoa fazia o sistema mandar
 * emails para contas alheias). Devolve null tanto para email inexistente como para password errada,
 * para não revelar que contas existem.
 */
export async function verificarCredenciais(
  email: unknown,
  palavraPasse: unknown,
  ip?: string,
): Promise<UtilizadorAutenticado | null> {
  // typeof: sem isto, um objeto ({"$ne": null}) entrava como operador na consulta (injeção NoSQL).
  if (typeof email !== "string" || typeof palavraPasse !== "string") {
    return null;
  }

  await ligarBaseDados();

  const emailNormalizado = email.trim().toLowerCase();

  // Limite de tentativas ANTES do Argon2id: trava quem adivinha passwords e evita gastar 19 MiB de
  // memória por tentativa de quem já está bloqueado.
  const desde = new Date(Date.now() - JANELA_MINUTOS * 60 * 1000);
  const falhasRecentes = await TentativaLogin.countDocuments({
    email: emailNormalizado,
    quando: { $gte: desde },
  });
  if (falhasRecentes >= MAX_TENTATIVAS) {
    return null;
  }

  // select("+palavraPasse"): o campo tem select: false no modelo.
  const utilizador = await Utilizador.findOne({
    email: emailNormalizado,
  }).select("+palavraPasse");

  // Sem conta, ou conta só com login por Google.
  if (!utilizador || !utilizador.palavraPasse) {
    await registarFalha(emailNormalizado, ip);
    return null;
  }

  const passwordCorreta = await verificarPassword(
    palavraPasse,
    utilizador.palavraPasse,
  );

  if (!passwordCorreta) {
    await registarFalha(emailNormalizado, ip);
    return null;
  }

  // Entrou: as falhas anteriores deixam de contar.
  await TentativaLogin.deleteMany({ email: emailNormalizado });

  return {
    id: utilizador._id.toString(),
    email: utilizador.email,
    name: utilizador.nomeCompleto,
    perfil: utilizador.perfil,
  };
}

/**
 * Chamado pelo Auth.js para decidir se alguém entra: password certa e, em admin/gestor, o código por email.
 * O código verifica-se AQUI e não só no ecrã: uma Server Action é um endereço HTTP normal, e quem soubesse
 * a password do admin chamava o signIn diretamente e saltava o passo.
 */
export async function autorizarCredenciais(
  email: unknown,
  palavraPasse: unknown,
  codigo: unknown,
  ip?: string,
): Promise<UtilizadorAutenticado | null> {
  const utilizador = await verificarCredenciais(email, palavraPasse, ip);
  if (!utilizador) return null;

  if (!precisaDoisFatores(utilizador.perfil)) {
    return utilizador;
  }

  if (!(await confirmarCodigo(utilizador.email, codigo))) {
    return null;
  }

  return utilizador;
}

/** Guarda uma falha de login (o índice TTL apaga-a sozinho). Se a escrita falhar, o login segue em frente. */
async function registarFalha(email: string, ip?: string): Promise<void> {
  try {
    await TentativaLogin.create({ email, ip, quando: new Date() });
  } catch {
    // Ignorado de propósito — ver comentário acima.
  }
}
