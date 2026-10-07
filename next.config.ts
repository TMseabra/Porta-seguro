import type { NextConfig } from "next";

/**
 * Content-Security-Policy: diz ao browser de onde esta página pode carregar cada coisa; é a última
 * defesa contra XSS. 'unsafe-inline' nos scripts porque o Next.js injeta scripts próprios sem nonce e
 * bloqueá-los partia o site; o resto da política mantém-se (sem <object>, sem iframes à volta,
 * formulários só para nós). 'unsafe-eval' só em desenvolvimento (hot reload).
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // data: para o QR (imagem embutida); https: porque a foto do aluno é um endereço externo.
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  // A câmara do leitor de QR usa blobs.
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Módulo nativo: sem isto o build da Vercel tentava incluí-lo no bundle e falhava.
  serverExternalPackages: ["@node-rs/argon2"],

  // O Next.js não envia headers de segurança sozinho. (HTTPS/HSTS já vêm da Vercel.)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Impede a portaria de ser aberta num <iframe> de outro site (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },

          { key: "Content-Security-Policy", value: CSP },

          // O browser respeita o Content-Type enviado, sem adivinhar.
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Os nossos URLs têm ids de alunos e turmas: sites externos não recebem o endereço completo.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // A portaria precisa da câmara: só se limita à nossa origem.
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
