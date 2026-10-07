/**
 * Emails do sistema (alerta de login, código do 2FA, aviso de movimento) pela API do Resend com
 * fetch, sem SDK: é um único POST e fica mais fácil de explicar.
 * Uma falha aqui nunca impede o login: só fica registada no log do servidor.
 */

import { formatarDataHora } from "@/lib/datas";
import { EMAIL_CONTA_DE_TESTE_QR } from "@/lib/dispositivo";
import type { Perfil, TipoRegisto } from "@/lib/constantes";

const AZUL = "#1d4ed8";

/**
 * Escapa texto para o HTML do email. O IP vem de um cabeçalho do pedido (x-forwarded-for),
 * que quem envia controla.
 */
function escaparHtml(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Cartão de email com <table> e estilos inline: é o que a Gmail e o Outlook respeitam
 * (ignoram o <style> do cabeçalho).
 */
function moldura(tituloTopo: string, corTopo: string, corpoHtml: string): string {
  return `<!doctype html>
<html lang="pt-PT">
<body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:${corTopo};padding:20px 28px;">
            <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:0.02em;">PortãoSeguro</span>
            <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:2px;">${tituloTopo}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            ${corpoHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">
              Email automático do PortãoSeguro — sistema de registo de entradas e saídas escolares. Não respondas a este email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function linha(rotulo: string, valor: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;">${rotulo}</td>
    <td style="padding:6px 0 6px 12px;color:#0f172a;font-size:13px;font-weight:600;">${valor}</td>
  </tr>`;
}

/**
 * Envia pelo Resend. Nunca lança, mas devolve se saiu: o 2FA precisa de saber, para não pedir
 * um código que nunca chegou.
 * O remetente de testes (onboarding@resend.dev) só entrega ao email da conta Resend, até haver
 * um domínio verificado. Vai texto e HTML: o texto é o que leitores de ecrã e clientes antigos mostram.
 */
async function enviarEmail(
  destinatario: string,
  assunto: string,
  texto: string,
  html: string,
): Promise<boolean> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) return false;

  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PortãoSeguro <onboarding@resend.dev>",
        to: destinatario,
        subject: assunto,
        text: texto,
        html,
      }),
    });

    if (!resposta.ok) {
      console.error(`Resend recusou o email para ${destinatario}:`, await resposta.text());
      return false;
    }
    return true;
  } catch (erro) {
    console.error(`Falha ao enviar email para ${destinatario}:`, erro);
    return false;
  }
}

export function emailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Envia o código do 2FA; devolve false se o email não saiu (e o login é recusado).
 * EMAIL_2FA_DESTINO: sem domínio verificado o Resend só entrega ao email da conta, por isso
 * os códigos vão todos para lá.
 */
export async function enviarCodigoVerificacao(
  nome: string,
  emailDaConta: string,
  codigo: string,
  validadeMinutos: number,
): Promise<boolean> {
  const destinatario = process.env.EMAIL_2FA_DESTINO || emailDaConta;

  const texto =
    `Código para entrar no PortãoSeguro como ${nome} (${emailDaConta}):\n\n` +
    `    ${codigo}\n\n` +
    `Serve durante ${validadeMinutos} minutos e só pode ser usado uma vez.\n\n` +
    "Se não foste tu a tentar entrar, alguém sabe a palavra-passe desta " +
    "conta: dirige-te ao informático da escola e pede para a trocar já.";

  const html = moldura(
    "Código de acesso",
    AZUL,
    `<p style="margin:0 0 16px;color:#334155;font-size:14px;">Pedido de entrada para <strong>${escaparHtml(nome)}</strong> (${escaparHtml(emailDaConta)}):</p>
     <div style="text-align:center;margin:0 0 16px;">
       <span style="display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 24px;font-size:32px;font-weight:700;letter-spacing:0.3em;color:${AZUL};">${escaparHtml(codigo)}</span>
     </div>
     <p style="margin:0 0 20px;color:#64748b;font-size:13px;">Válido por ${validadeMinutos} minutos, e só pode ser usado uma vez.</p>
     <div style="border-left:3px solid #f59e0b;background:#fffbeb;padding:10px 14px;border-radius:6px;">
       <p style="margin:0;color:#78350f;font-size:12px;">Se não foste tu a tentar entrar, alguém sabe a palavra-passe desta conta — dirige-te ao informático da escola e pede para a trocar já.</p>
     </div>`,
  );

  return enviarEmail(destinatario, `PortãoSeguro: código de acesso ${codigo}`, texto, html);
}

/**
 * Perfis cujo login gera alerta: contas com poder sobre dados de outros. Alunos e porteiro
 * ficam de fora para não encher a caixa de correio.
 */
const PERFIS_COM_ALERTA_DE_LOGIN: Perfil[] = [
  "professor",
  "dt",
  "coordenador",
  "gestor",
  "admin",
];

/**
 * Avisa a administração dos logins de contas com mais permissões. O IP dá uma pista de onde
 * partiu o acesso, não uma prova: numa escola todos saem pelo mesmo endereço.
 */
export async function notificarLogin(
  nome: string,
  email: string,
  perfil: Perfil,
  ip?: string,
): Promise<void> {
  if (!PERFIS_COM_ALERTA_DE_LOGIN.includes(perfil)) return;

  const destinatario = process.env.EMAIL_ALERTA_ADMIN;
  if (!destinatario) return;

  const quando = formatarDataHora(new Date());
  const enderecoIp = ip ?? "desconhecido";

  const texto =
    `${nome} (${email}, perfil "${perfil}") entrou no PortãoSeguro.\n\n` +
    `Quando: ${quando}\n` +
    `Endereço IP: ${enderecoIp}\n\n` +
    // Não há troca de palavra-passe self-service: só um admin muda a de outra pessoa.
    "Se não reconheces este acesso, dirige-te ao informático da escola " +
    "e pede para trocar a palavra-passe dessa conta.";

  const html = moldura(
    "Login de nível superior",
    AZUL,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
       ${linha("Nome", escaparHtml(nome))}
       ${linha("Email", escaparHtml(email))}
       ${linha("Perfil", `<span style="background:#eff6ff;color:${AZUL};padding:2px 8px;border-radius:999px;font-size:12px;">${escaparHtml(perfil)}</span>`)}
       ${linha("Quando", escaparHtml(quando))}
       ${linha("Endereço IP", escaparHtml(enderecoIp))}
     </table>
     <div style="border-left:3px solid #f59e0b;background:#fffbeb;padding:10px 14px;border-radius:6px;">
       <p style="margin:0;color:#78350f;font-size:12px;">Se não reconheces este acesso, dirige-te ao informático da escola e pede para trocar a palavra-passe desta conta.</p>
     </div>`,
  );

  await enviarEmail(destinatario, `PortãoSeguro: login de ${nome}`, texto, html);
}

/**
 * Avisa o aluno de cada entrada/saída registada, no email da própria conta.
 * Exceção: a conta de teste (EMAIL_CONTA_DE_TESTE_QR) tem um domínio real que o Resend recusa
 * sem domínio verificado, por isso vai para EMAIL_2FA_DESTINO, como o 2FA. As contas reais
 * ficam sujeitas à mesma limitação.
 */
export async function notificarMovimento(
  nomeAluno: string,
  emailAluno: string,
  tipo: TipoRegisto,
  autorizado: boolean,
  motivo: string,
  momento: Date,
): Promise<void> {
  const destinatario =
    emailAluno === EMAIL_CONTA_DE_TESTE_QR
      ? process.env.EMAIL_2FA_DESTINO || emailAluno
      : emailAluno;

  const tipoTexto = tipo === "entrada" ? "Entrada" : "Saída";
  const estadoTexto = autorizado ? "autorizada" : "NÃO autorizada";
  const quando = formatarDataHora(momento);
  const corEstado = autorizado ? "#16a34a" : "#dc2626";

  const texto =
    `${tipoTexto} ${estadoTexto} para ${nomeAluno}, às ${quando}.\n\n` + `Motivo: ${motivo}`;

  const html = moldura(
    `${tipoTexto} registada`,
    autorizado ? "#16a34a" : "#dc2626",
    `<div style="text-align:center;margin:0 0 18px;">
       <span style="display:inline-block;background:${autorizado ? "#f0fdf4" : "#fef2f2"};color:${corEstado};border:1px solid ${autorizado ? "#bbf7d0" : "#fecaca"};padding:6px 16px;border-radius:999px;font-size:13px;font-weight:700;">${tipoTexto} ${estadoTexto}</span>
     </div>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
       ${linha("Aluno", escaparHtml(nomeAluno))}
       ${linha("Quando", escaparHtml(quando))}
       ${linha("Motivo", escaparHtml(motivo))}
     </table>`,
  );

  await enviarEmail(
    destinatario,
    `PortãoSeguro: ${tipoTexto.toLowerCase()} registada — ${quando}`,
    texto,
    html,
  );
}
