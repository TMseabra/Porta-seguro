import Image from "next/image";

/** Só o escudo, recortado do logótipo (o mesmo do favicon), porque o logótipo completo inclui o nome. */
export function Logo({
  className = "h-9 w-9",
  decorativa = false,
}: {
  className?: string;
  /** `true` ao lado do `<LogoTexto>`, para o leitor de ecrã não dizer o nome duas vezes. */
  decorativa?: boolean;
}) {
  return (
    <Image
      src="/logo-marca.png"
      alt={decorativa ? "" : "PortãoSeguro"}
      width={40}
      height={40}
      priority
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
