export function passkeyValida(formData: FormData): boolean {
  const chave = process.env.ADMIN_PASSKEY;
  const digitada = String(formData.get("passkey") ?? "").trim();
  return Boolean(chave) && digitada === chave;
}

export const ERRO_PASSKEY = "Palavra-chave de confirmação incorreta.";
