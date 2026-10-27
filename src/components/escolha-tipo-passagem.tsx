"use client";

import { useId } from "react";

export type TipoEscolhido = "auto" | "entrada" | "saida";

const OPCOES: { valor: TipoEscolhido; rotulo: string }[] = [
  { valor: "auto", rotulo: "Automático" },
  { valor: "entrada", rotulo: "Entrada" },
  { valor: "saida", rotulo: "Saída" },
];

/** Direção numa simulação: "Automático" alterna com o último registo; as outras forçam. */
export function EscolhaTipoPassagem({
  valor,
  onAlterar,
}: {
  valor: TipoEscolhido;
  onAlterar: (valor: TipoEscolhido) => void;
}) {
  const nome = useId();
  return (
    <fieldset className="campo">
      <legend>Tipo de passagem</legend>
      <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--foreground)" }}>
        {OPCOES.map((opcao) => (
          <label key={opcao.valor} className="flex items-center gap-1.5">
            <input
              type="radio"
              name={nome}
              value={opcao.valor}
              checked={valor === opcao.valor}
              onChange={() => onAlterar(opcao.valor)}
              style={{ width: "auto" }}
            />
            {opcao.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
