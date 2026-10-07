/**
 * Ligação ao MongoDB Atlas (Mongoose), guardada numa variável global.
 * Na Vercel (serverless) cada pedido pode criar uma instância nova do código: abrir uma ligação por pedido
 * esgotava o limite do plano gratuito do Atlas. Em desenvolvimento, o hot reload recarrega os módulos e,
 * sem esta cache, ficavam dezenas de ligações abertas.
 */

import mongoose, { type Mongoose } from "mongoose";

interface CacheLigacao {
  ligacao: Mongoose | null;
  /** Ligação em curso, para não iniciar duas ao mesmo tempo. */
  promessa: Promise<Mongoose> | null;
}

declare global {
  var _cacheMongoose: CacheLigacao | undefined;
}

const cache: CacheLigacao = global._cacheMongoose ?? {
  ligacao: null,
  promessa: null,
};
global._cacheMongoose = cache;

/** Devolve a ligação, criando-a só na primeira vez. Usar sempre esta função, nunca mongoose.connect. */
export async function ligarBaseDados(): Promise<Mongoose> {
  if (cache.ligacao) {
    return cache.ligacao;
  }

  if (!cache.promessa) {
    // Lê-se aqui dentro e não no topo para o `npm run build` não falhar em máquinas sem .env.
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "A variável de ambiente MONGODB_URI não está definida. " +
          "Copia o ficheiro .env.example para .env.local e preenche-a.",
      );
    }

    cache.promessa = mongoose.connect(uri, {
      // Sem fila de comandos enquanto não há ligação: um erro imediato é melhor do que um pedido pendurado.
      bufferCommands: false,
    });
  }

  try {
    cache.ligacao = await cache.promessa;
  } catch (erro) {
    // Se falhar, limpa a promessa para a próxima tentativa recomeçar do zero.
    cache.promessa = null;
    throw erro;
  }

  return cache.ligacao;
}
