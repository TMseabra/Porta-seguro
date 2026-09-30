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
      className="hover-highlight flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
    >
      <span aria-hidden>{escuro ? "☀" : "☾"}</span>
      <span className="hidden sm:inline">{escuro ? "Modo claro" : "Modo escuro"}</span>
    </button>
  );
}
