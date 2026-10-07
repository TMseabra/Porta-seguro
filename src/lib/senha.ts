/**
 * Hash e verificação de palavras-passe (RNF05) com Argon2id (@node-rs/argon2: binário nativo em Rust,
 * só corre em Node). Argon2id e não SHA-256: um hash "normal" é rápido, e um atacante com o hash testa
 * milhões de passwords por segundo numa placa gráfica; o Argon2id é lento e gasta memória de propósito
 * (é o recomendado pela OWASP).
 */

import { hash, verify } from "@node-rs/argon2";

/**
 * Parâmetros escritos à mão, em vez de depender dos valores por omissão da biblioteca.
 * `algorithm: 2` é o Argon2id: escreve-se o número porque o Next.js compila cada ficheiro isolado
 * (isolatedModules) e não aceita os `const enum` do pacote.
 */
const OPCOES_ARGON2ID = {
  algorithm: 2, // Algorithm.Argon2id
  memoryCost: 19456, // 19 MiB de memória por tentativa
  timeCost: 2, // 2 iterações
  parallelism: 1, // 1 thread
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
