import { handlers } from "@/auth";

// Obrigatório: o Credentials usa Argon2id (nativo) e Mongoose (TCP), que não funcionam no Edge.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
