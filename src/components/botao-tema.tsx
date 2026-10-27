"use client";

import { useTheme } from "next-themes";

/** Alterna entre claro e escuro. O texto é sempre o mesmo, por isso servidor e browser desenham o mesmo HTML. */
export function BotaoTema() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      ☾ Tema
    </button>
  );
}
