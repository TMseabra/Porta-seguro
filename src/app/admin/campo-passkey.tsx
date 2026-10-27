export function CampoPasskey() {
  return (
    <label className="campo">
      Palavra-chave de confirmação
      <input
        name="passkey"
        type="password"
        required
        autoComplete="off"
      />
    </label>
  );
}
