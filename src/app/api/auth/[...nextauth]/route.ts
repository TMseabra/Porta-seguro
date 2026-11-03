import { handlers } from "@/auth";

// Node.js obrigatório: Argon2id e Mongoose não correm no Edge.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
