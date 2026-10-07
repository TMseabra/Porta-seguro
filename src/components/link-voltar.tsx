import Link from "next/link";

export function LinkVoltar({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="w-fit text-sm opacity-70 hover:underline hover:opacity-100">
      ← {label}
    </Link>
  );
}
