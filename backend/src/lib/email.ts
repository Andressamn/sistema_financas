// Helper centralizado para envio de emails.
// Em dev: imprime no console. Em produção: usa Resend se RESEND_API_KEY estiver setada.
//
// Resend é grátis (3000 emails/mês) e exige verificar um domínio próprio.
// Pra testar sem domínio próprio, use o domínio padrão "onboarding@resend.dev"
// que entrega apenas para o email cadastrado na conta Resend.

let resendClient: any = null;

async function getResend() {
  if (resendClient) return resendClient;
  if (!process.env.RESEND_API_KEY) return null;
  const { Resend } = await import('resend');
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = await getResend();

  if (!resend) {
    // Modo dev: log no console
    console.log('\n=== PASSWORD RESET REQUEST ===');
    console.log(`To: ${to}`);
    console.log(`Reset link: ${resetUrl}`);
    console.log('================================\n');
    return;
  }

  // Modo produção: envia email real
  const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
  await resend.emails.send({
    from,
    to,
    subject: 'Redefinição de senha — App de Finanças',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #047857;">Redefinir sua senha</h2>
        <p>Você solicitou redefinir sua senha do App de Finanças.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}"
             style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Redefinir senha
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">Ou copie e cole este link no navegador:</p>
        <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          Esse link expira em 1 hora. Se você não solicitou, ignore este email.
        </p>
      </div>
    `,
  });
}
