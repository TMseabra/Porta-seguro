"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

/**
 * Substituto do <select> nativo, cujo menu aberto é desenhado pelo sistema operativo e não se pode
 * estilizar. Segue o padrão WAI-ARIA de listbox recolhível: setas movem a opção ativa sem tirar o
 * foco do botão, Home/Fim saltam, Enter/espaço confirmam, Escape fecha.
 */
export function SelectPersonalizado({
  rotulo,
  valor,
  opcoes,
  onAlterar,
  className = "",
}: {
  rotulo: string;
  valor: string;
  opcoes: OpcaoSelect[];
  onAlterar: (valor: string) => void;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  // Opção "ativa": destacada sem o foco sair do botão; é o que o aria-activedescendant aponta.
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const idBotao = useId();
  const idLista = useId();

  const indiceSelecionado = Math.max(
    0,
    opcoes.findIndex((o) => o.valor === valor),
  );

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (raiz.current && !raiz.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  function abrir() {
    setIndiceAtivo(indiceSelecionado);
    setAberto(true);
  }

  /** Fecha e devolve o foco ao botão, senão o foco perdia-se quando a lista desaparece. */
  function fechar() {
    setAberto(false);
    botaoRef.current?.focus();
  }

  function escolher(indice: number) {
    const opcao = opcoes[indice];
    if (!opcao) return;
    onAlterar(opcao.valor);
    fechar();
  }

  function aoTeclarNoBotao(evento: React.KeyboardEvent) {
    if (opcoes.length === 0) return;

    switch (evento.key) {
      case "ArrowDown":
      case "ArrowUp":
      case " ":
      case "Enter":
        // A 1.ª seta/Enter/espaço abre a lista; a partir daí as setas movem.
        evento.preventDefault();
        if (!aberto) {
          abrir();
        } else if (evento.key === "ArrowDown") {
          setIndiceAtivo((i) => Math.min(i + 1, opcoes.length - 1));
        } else if (evento.key === "ArrowUp") {
          setIndiceAtivo((i) => Math.max(i - 1, 0));
        } else {
          escolher(indiceAtivo);
        }
        break;
      case "Home":
        if (aberto) {
          evento.preventDefault();
          setIndiceAtivo(0);
        }
        break;
      case "End":
        if (aberto) {
          evento.preventDefault();
          setIndiceAtivo(opcoes.length - 1);
        }
        break;
      case "Escape":
        if (aberto) {
          evento.preventDefault();
          fechar();
        }
        break;
    }
  }

  const selecionada = opcoes.find((o) => o.valor === valor);
  const idOpcaoAtiva = aberto ? `${idLista}-${indiceAtivo}` : undefined;

  return (
    <div ref={raiz} className={`relative flex flex-col gap-1 text-sm ${className}`}>
      <span id={idBotao} className="text-slate-700 dark:text-slate-300">
        {rotulo}
      </span>
      <button
        ref={botaoRef}
        type="button"
        // role="combobox": um <button> simples não suporta aria-activedescendant (jsx-a11y/role-supports-aria-props).
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={idLista}
        aria-labelledby={idBotao}
        aria-activedescendant={idOpcaoAtiva}
        onClick={() => (aberto ? fechar() : abrir())}
        onKeyDown={aoTeclarNoBotao}
        className="flex items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left transition hover:border-blue-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600"
      >
        <span>{selecionada?.rotulo ?? "Selecionar"}</span>
        <IconeChevron aberto={aberto} />
      </button>

      {aberto && (
        <ul
          id={idLista}
          role="listbox"
          aria-labelledby={idBotao}
          className="absolute top-full left-0 z-20 mt-1 max-h-64 w-full min-w-max overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
        >
          {opcoes.map((opcao, indice) => {
            const selecionadaAtual = opcao.valor === valor;
            const ativa = indice === indiceAtivo;
            return (
              <li key={opcao.valor}>
                <button
                  type="button"
                  id={`${idLista}-${indice}`}
                  role="option"
                  aria-selected={selecionadaAtual}
                  // tabIndex -1: o foco do teclado nunca sai do botão; só a opção ativa muda.
                  tabIndex={-1}
                  onMouseEnter={() => setIndiceAtivo(indice)}
                  onClick={() => escolher(indice)}
                  className={`block w-full rounded-lg px-3 py-2 text-left transition ${
                    selecionadaAtual
                      ? "bg-blue-700 text-white"
                      : ativa
                        ? "bg-blue-50 text-slate-700 dark:bg-blue-950/60 dark:text-slate-200"
                        : "text-slate-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-950/40"
                  }`}
                >
                  {opcao.rotulo}
                </button>
              </li>
            );
          })}
          {opcoes.length === 0 && (
            <li className="px-3 py-2 text-slate-500 dark:text-slate-400">Sem opções.</li>
          )}
        </ul>
      )}
    </div>
  );
}

function IconeChevron({ aberto }: { aberto: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      aria-hidden
      className={`shrink-0 text-slate-500 transition-transform duration-150 dark:text-slate-400 ${aberto ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
