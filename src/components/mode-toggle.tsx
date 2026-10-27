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
 * Botão do tema como no shadcn/ui. Sol e lua trocam só com CSS (`dark:`): o servidor e o browser desenham
 * o mesmo HTML e não há piscar.
 */
export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-white/40 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
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
