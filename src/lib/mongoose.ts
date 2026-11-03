/** Ligação em cache global: em serverless, uma por pedido esgotava o limite do Atlas. */

import mongoose, { type Mongoose } from "mongoose";

interface CacheLigacao {
  ligacao: Mongoose | null;
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

export async function ligarBaseDados(): Promise<Mongoose> {
  if (cache.ligacao) {
    return cache.ligacao;
  }

  if (!cache.promessa) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "A variável de ambiente MONGODB_URI não está definida. " +
          "Copia o ficheiro .env.example para .env.local e preenche-a.",
      );
    }

    cache.promessa = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    cache.ligacao = await cache.promessa;
  } catch (erro) {
    cache.promessa = null;
    throw erro;
  }

  return cache.ligacao;
}
