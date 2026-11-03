import Image from "next/image";

export function Logo({
  className = "h-9 w-9",
  decorativa = false,
}: {
  className?: string;
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
