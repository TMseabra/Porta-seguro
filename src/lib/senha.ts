import { hash, verify } from "@node-rs/argon2";

/** algorithm: 2 = Argon2id, em número porque isolatedModules não aceita const enum. */
const OPCOES_ARGON2ID = {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(palavraPasseSimples: string): Promise<string> {
  return hash(palavraPasseSimples, OPCOES_ARGON2ID);
}

export async function verificarPassword(
  palavraPasseSimples: string,
  hashGuardado: string,
): Promise<boolean> {
  return verify(hashGuardado, palavraPasseSimples, OPCOES_ARGON2ID);
}
