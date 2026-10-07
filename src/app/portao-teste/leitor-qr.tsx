"use client";

import { useEffect, useRef } from "react";

const ID_ELEMENTO = "leitor-qr-portaria";

/** Câmara de leitura do QR (RF15). O pai monta-o só quando se escolhe "Ler código QR"; desmontar liberta a câmara. */
export function LeitorQR({ onLido }: { onLido: (token: string) => void }) {
  // Em ref para o efeito correr uma vez só e não reiniciar a câmara a cada `onLido` novo.
  const onLidoRef = useRef(onLido);
  useEffect(() => {
    onLidoRef.current = onLido;
  });

  useEffect(() => {
    let cancelado = false;
    let leitorAtual: import("html5-qrcode").Html5Qrcode | null = null;
    // Só uma chamada a `.stop()` de cada vez: duas paragens em simultâneo deixavam o ecrã preto no Safari
    // do iPhone (o Chrome tolera, o WebKit não).
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
            // Só avisa o pai com a câmara parada; senão o pai desmontava (`.clear()`) com o `.stop()` a meio.
            pararUmaVez().then(() => onLidoRef.current(textoDecodificado));
          },
          () => {
            // Chamado em cada frame sem código encontrado — não é um erro.
          },
        );
      } catch {
        // Sem câmara ou sem permissão: o porteiro continua a poder usar o
        // cartão, por isso não há aqui nenhum ecrã de erro bloqueante.
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
