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

// Tem de ser em @auth/core/jwt: o "next-auth/jwt" só o re-exporta.
declare module "@auth/core/jwt" {
  interface JWT {
    idUtilizador?: string;
    perfil?: Perfil;
    expiraEm?: number;
  }
}
