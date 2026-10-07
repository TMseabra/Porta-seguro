/** Acrescenta `id` e `perfil` aos tipos do Auth.js, para o TypeScript aceitar `sessao.user.perfil`. */
import type { DefaultSession } from "next-auth";
import type { Perfil } from "@/lib/constantes";

declare module "next-auth" {
  interface User {
    perfil?: Perfil;
  }

  interface Session {
    user: {
      id: string;
      perfil: Perfil;
    } & DefaultSession["user"];
  }
}

// Tem de ser no módulo de origem (@auth/core/jwt): o "next-auth/jwt" só o re-exporta e a augmentation aí
// não chega aos callbacks.
declare module "@auth/core/jwt" {
  interface JWT {
    idUtilizador?: string;
    perfil?: Perfil;
    /** Instante (ms) em que a sessão deixa de valer, além das 8 horas. Só admin e gestor (expulsos à meia-noite). */
    expiraEm?: number;
  }
}
