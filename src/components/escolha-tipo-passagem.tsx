"use client";

import { useId } from "react";

export type TipoEscolhido = "auto" | "entrada" | "saida";

const OPCOES: { valor: TipoEscolhido; rotulo: string }[] = [
  { valor: "auto", rotulo: "Automático" },
  { valor: "entrada", rotulo: "Entrada" },
  { valor: "saida", rotulo: "Saída" },
];

/**
 * Escolha da direção numa SIMULAÇÃO (ferramenta do admin e QR da conta de
 * teste). "Automático" mantém a regra normal — alterna com o último
 * registo; as outras duas forçam a direção, para dar para testar uma saída
 * sem ter de simular primeiro uma entrada, por exemplo.
 *
 * Feito com <input type="radio"> a sério (escondidos, com a etiqueta a
 * fazer de botão): assim as setas do teclado mudam de opção e um leitor de
 * ecrã anuncia-o como um grupo de escolha única, sem código extra.
 */
export function EscolhaTipoPassagem({
  valor,
  onAlterar,
}: {
  valor: TipoEscolhido;
  onAlterar: (valor: TipoEscolhido) => void;
}) {
  const nome = useId();
  return (
    <fieldset className="flex flex-col gap-1.5 text-sm">
      <legend className="mb-1.5">Tipo de passagem</legend>
      <div className="inline-flex w-fit rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
        {OPCOES.map((opcao) => (
          <label
            key={opcao.valor}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 ${
              valor === opcao.valor
                ? "bg-blue-700 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            <input
              type="radio"
              name={nome}
              value={opcao.valor}
              checked={valor === opcao.valor}
              onChange={() => onAlterar(opcao.valor)}
              className="sr-only"
            />
            {opcao.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
