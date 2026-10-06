"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Tema claro/escuro com o `next-themes` (o que o shadcn/ui recomenda). Ele
 * acrescenta ou tira a classe "dark" no <html> — que é o que as regras
 * `dark:` do Tailwind leem (ver o @custom-variant em globals.css) — e mete
 * no <head> um pequeno script que a aplica ANTES de a página aparecer, por
 * isso não há o piscar de claro para escuro ao carregar.
 *
 * `storageKey` novo de propósito: o tema antigo do site guardava "claro" /
 * "escuro" na chave "portao-tema", valores que o next-themes não entende.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="portao-seguro-tema"
    >
      {children}
    </NextThemesProvider>
  );
}
