"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes: põe/tira a classe "dark" no <html> (lida pelo `@custom-variant` do globals.css) e aplica-a
 * antes de a página aparecer. `storageKey` novo: a chave antiga "portao-tema" tem valores que ele não entende.
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
