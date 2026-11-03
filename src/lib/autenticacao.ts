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

export async function verificarCredenciais(
  email: unknown,
  palavraPasse: unknown,
  ip?: string,
): Promise<UtilizadorAutenticado | null> {
  // typeof: evita injeção NoSQL ({"$ne": null}).
  if (typeof email !== "string" || typeof palavraPasse !== "string") {
    return null;
  }

  await ligarBaseDados();

  const emailNormalizado = email.trim().toLowerCase();

  // Limite ANTES do Argon2id: não gastar memória com quem já está bloqueado.
  const desde = new Date(Date.now() - JANELA_MINUTOS * 60 * 1000);
  const falhasRecentes = await TentativaLogin.countDocuments({
    email: emailNormalizado,
    quando: { $gte: desde },
  });
  if (falhasRecentes >= MAX_TENTATIVAS) {
    return null;
  }

  const utilizador = await Utilizador.findOne({
    email: emailNormalizado,
  }).select("+palavraPasse");

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

  await TentativaLogin.deleteMany({ email: emailNormalizado });

  return {
    id: utilizador._id.toString(),
    email: utilizador.email,
    name: utilizador.nomeCompleto,
    perfil: utilizador.perfil,
  };
}

/** O 2FA verifica-se aqui e não só no ecrã: uma Server Action é chamável diretamente. */
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

async function registarFalha(email: string, ip?: string): Promise<void> {
  try {
    await TentativaLogin.create({ email, ip, quando: new Date() });
  } catch {
  }
}
