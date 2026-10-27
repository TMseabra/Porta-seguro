"use client";

import { useActionState, useState } from "react";
import { entrarComCredenciais, type EstadoLogin } from "./acoes";

/** Cliente por causa do `useActionState`. */
export function FormularioCredenciais() {
  const [estado, acao, aEnviar] = useActionState<EstadoLogin, FormData>(entrarComCredenciais, {
    passo: "credenciais",
  });
  const [passwordVisivel, setPasswordVisivel] = useState(false);
  const [codigo, setCodigo] = useState("");
  const pedeCodigo = estado.passo === "codigo";
  // Controlados: depois de uma Server Action sem navegação o browser repunha o <form> e apagava o escrito.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={acao} className="flex flex-col gap-3">
      <label className="campo">
        Email institucional
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />
      </label>

      <label className="campo">
        Palavra-passe
        <div className="relative">
          <input
            type={passwordVisivel ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            style={{ paddingRight: "2.25rem" }}
          />
          <button
            type="button"
            onClick={() => setPasswordVisivel((atual) => !atual)}
            aria-label={passwordVisivel ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
            aria-pressed={passwordVisivel}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center opacity-60 hover:opacity-100"
          >
            {passwordVisivel ? <IconeOlhoFechado /> : <IconeOlho />}
          </button>
        </div>
      </label>

      {pedeCodigo && (
        <label className="campo">
          Código de acesso
          <input
            // `inputMode="numeric"` abre o teclado de números; `one-time-code` deixa o iOS/Android sugerir o código.
            type="text"
            name="codigo"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            placeholder="000000"
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value.replace(/\D/g, ""))}
            style={{ textAlign: "center", letterSpacing: "0.4em" }}
          />
        </label>
      )}

      {estado.aviso && !estado.erro && (
        <p className="aviso aviso-amarelo">{estado.aviso}</p>
      )}
      {estado.erro && <p className="aviso aviso-vermelho">{estado.erro}</p>}

      <button type="submit" disabled={aEnviar} className="botao">
        {aEnviar ? "A entrar..." : pedeCodigo ? "Confirmar código" : "Entrar"}
      </button>
    </form>
  );
}

function IconeOlho() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconeOlhoFechado() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
