"use client";

/**
 * Submit que pede confirmação (UC03) e a palavra-chave via `prompt()`, injetada num campo escondido; a
 * Server Action é que a valida.
 */
export function BotaoConfirmar({
  mensagem,
  className,
  children,
}: {
  mensagem: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(evento) => {
        const digitada = window.prompt(
          `${mensagem}\n\nEscreve a palavra-chave de confirmação:`,
        );
        if (digitada === null) {
          evento.preventDefault();
          return;
        }

        const form = evento.currentTarget.form;
        if (!form) return;

        let campoPasskey = form.elements.namedItem("passkey") as HTMLInputElement | null;
        if (!campoPasskey) {
          campoPasskey = document.createElement("input");
          campoPasskey.type = "hidden";
          campoPasskey.name = "passkey";
          form.appendChild(campoPasskey);
        }
        campoPasskey.value = digitada;
      }}
    >
      {children}
    </button>
  );
}
