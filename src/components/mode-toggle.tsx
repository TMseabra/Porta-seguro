"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Botão do tema, como no shadcn/ui (https://ui.shadcn.com/docs/dark-mode/next):
 * um botão com sol/lua que abre um menu "Claro / Escuro / Sistema".
 *
 * O sol e a lua trocam só com CSS (`dark:`), sem ler o tema em JavaScript —
 * por isso o servidor e o browser desenham exatamente o mesmo HTML e não há
 * o "piscar" do tema errado ao carregar a página.
 */
export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-900 shadow-xs transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden dark:border-white/15 dark:bg-white/[.04] dark:text-slate-100 dark:hover:bg-white/10"
        >
          <Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" aria-hidden />
          <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" aria-hidden />
          <span className="sr-only">Mudar tema</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Claro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Escuro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">Sistema</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
