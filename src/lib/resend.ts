const RESEND_API_URL = "https://api.resend.com/emails";

// Enquanto o domínio próprio não estiver verificado no Resend, use esse remetente
// de teste — ele funciona sem configuração extra, mas com limites (só entrega
// pro seu próprio e-mail de cadastro no Resend). Depois de verificar um domínio
// (grátis, no painel do Resend), troque RESEND_FROM pra algo tipo
// "José+ <avisos@seudominio.com.br>".
const FROM = process.env.RESEND_FROM || "José+ <onboarding@resend.dev>";

export async function sendAvisoEmail(destinatarios: string[], texto: string, data: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || destinatarios.length === 0) return;

  await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      from: FROM,
      to: destinatarios,
      subject: "Novo aviso do José+",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color:#f97316;">Novo aviso da escola</h2>
          <p style="font-size:15px; color:#18181b; line-height:1.5;">${texto}</p>
          <p style="font-size:12px; color:#71717a;">Data: ${data}</p>
          <p style="font-size:11px; color:#a1a1aa; margin-top:24px;">
            Você está recebendo isso porque se inscreveu pra receber avisos do José+.
          </p>
        </div>
      `
    })
  }).catch((err) => console.error("Erro ao enviar e-mail via Resend:", err));
}
