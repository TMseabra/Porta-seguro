"use client";

import { useEffect, useSyncExternalStore } from "react";

type Tema = "claro" | "escuro";

/**
 * A fonte de verdade do tema é a classe "dark" no <html> (é o que as regras
 * `dark:` do Tailwind leem). Em vez de copiar esse valor para um useState —
 * o que obrigava a um setState dentro de um useEffect e o ESLint do React
 * recusa (react-hooks/set-state-in-effect) — os componentes "subscrevem"
 * diretamente essa classe com useSyncExternalStore.
 */
const ouvintes = new Set<() => void>();

function subscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function lerTema(): Tema {
  return document.documentElement.classList.contains("dark") ? "escuro" : "claro";
}

function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle("dark", tema === "escuro");
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    aplicarTema(window.localStorage.getItem("portao-tema") === "claro" ? "claro" : "escuro");
  }, []);

  return <>{children}</>;
}

export function ThemeToggle() {
  // No servidor não há <html> para ler: assume escuro, que é o tema por omissão.
  const tema = useSyncExternalStore(subscrever, lerTema, () => "escuro" as Tema);
  const escuro = tema === "escuro";

  function alternar() {
    const proximo: Tema = escuro ? "claro" : "escuro";
    aplicarTema(proximo);
    window.localStorage.setItem("portao-tema", proximo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={`Mudar para modo ${escuro ? "claro" : "escuro"}`}
      title={`Mudar para modo ${escuro ? "claro" : "escuro"}`}
      className="hover-highlight group flex h-10 shrink-0 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-100 dark:hover:bg-indigo-400/20 dark:focus-visible:outline-indigo-300"
    >
      <span aria-hidden className="text-base leading-none">{escuro ? "☀️" : "🌙"}</span>
      <span>{escuro ? "Claro" : "Escuro"}</span>
    </button>
  );
}
