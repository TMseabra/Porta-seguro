/**
 * Palavra-chave extra para editar/remover (decisão do aluno); criar não a pede. Vive só em `ADMIN_PASSKEY`:
 * no código deixava de ser secreta assim que o repositório fosse partilhado.
 */
export function passkeyValida(formData: FormData): boolean {
  const chave = process.env.ADMIN_PASSKEY;
  const digitada = String(formData.get("passkey") ?? "").trim();
  return Boolean(chave) && digitada === chave;
}

export const ERRO_PASSKEY = "Palavra-chave de confirmação incorreta.";
