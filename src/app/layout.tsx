import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Título e descrição que aparecem no separador do navegador.
export const metadata: Metadata = {
  title: "PortãoSeguro",
  description: "Sistema de registo de entradas e saídas escolares",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // lang="pt-PT" para o navegador e os leitores de ecrã saberem que o
    // conteúdo está em português de Portugal.
    // suppressHydrationWarning: o next-themes muda a classe do <html> (claro/
    // escuro) antes de o React arrancar — sem isto o React avisava que o
    // servidor e o browser não coincidem. Só vale para este elemento.
    <html
      lang="pt-PT"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
