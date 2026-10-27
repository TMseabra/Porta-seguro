"use client";

import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

/**
 * Alterna entre claro e escuro com um círculo que cresce a partir do botão (View Transitions API: o
 * navegador tira uma "foto" da página antes e depois, e animamos o recorte da nova por cima da antiga).
 * Sem suporte ou com "reduzir movimento", troca logo, sem animação.
 */
export function BotaoTema() {
  const { resolvedTheme, setTheme } = useTheme();

  function trocar(evento: React.MouseEvent<HTMLButtonElement>) {
    const novoTema = resolvedTheme === "dark" ? "light" : "dark";
    const semAnimacao =
      !document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semAnimacao) {
      setTheme(novoTema);
      return;
    }

    const caixa = evento.currentTarget.getBoundingClientRect();
    const x = caixa.left + caixa.width / 2;
    const y = caixa.top + caixa.height / 2;
    // Raio até ao canto mais distante, para o círculo acabar por cobrir o ecrã todo.
    const raio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    // flushSync: a classe do <html> tem de mudar já dentro da transição, senão a "foto" nova sai igual à antiga.
    const transicao = document.startViewTransition(() => flushSync(() => setTheme(novoTema)));

    transicao.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
        { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  return (
    <button type="button" onClick={trocar}>
      ☾ Tema
    </button>
  );
}
