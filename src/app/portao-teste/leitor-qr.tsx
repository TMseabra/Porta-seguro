"use client";

import { useEffect, useRef } from "react";

const ID_ELEMENTO = "leitor-qr-portaria";

export function LeitorQR({ onLido }: { onLido: (token: string) => void }) {
  const onLidoRef = useRef(onLido);
  useEffect(() => {
    onLidoRef.current = onLido;
  });

  useEffect(() => {
    let cancelado = false;
    let leitorAtual: import("html5-qrcode").Html5Qrcode | null = null;
    // Uma só chamada a .stop(): duas deixavam o ecrã preto no Safari.
    let promessaParagem: Promise<void> | null = null;
    function pararUmaVez(): Promise<void> {
      promessaParagem ??= leitorAtual ? leitorAtual.stop().catch(() => {}) : Promise.resolve();
      return promessaParagem;
    }

    async function iniciar() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelado) return;

      const leitor = new Html5Qrcode(ID_ELEMENTO);
      leitorAtual = leitor;

      try {
        await leitor.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 220 },
          (textoDecodificado) => {
            pararUmaVez().then(() => onLidoRef.current(textoDecodificado));
          },
          () => {
          },
        );
      } catch {
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      pararUmaVez()
        .then(() => leitorAtual?.clear())
        .catch(() => {});
    };
  }, []);

  return <div id={ID_ELEMENTO} className="mx-auto w-full max-w-xs" />;
}
