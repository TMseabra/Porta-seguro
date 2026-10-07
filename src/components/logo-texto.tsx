import Image from "next/image";

/**
 * Palavra "PortãoSeguro" do logótipo (public/logo-texto.png). A imagem é azul-escura: `brightness-0 invert`
 * pinta-a de branco no modo escuro, sem segundo ficheiro.
 */
export function LogoTexto({ className = "h-5" }: { className?: string }) {
  return (
    <Image
      src="/logo-texto.png"
      alt="PortãoSeguro"
      width={934}
      height={275}
      className={`w-auto object-contain dark:brightness-0 dark:invert ${className}`}
    />
  );
}
