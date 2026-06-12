import { Resend } from 'resend'

export function createResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no está configurado en .env.local')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendInvitationEmail({
  to,
  firstName,
  lastName,
  doctorName,
  token,
}: {
  to: string
  firstName: string
  lastName: string
  doctorName: string
  token: string
}) {
  const resend = createResendClient()
  const from = process.env.RESEND_FROM_EMAIL ?? 'Calmaa <onboarding@resend.dev>'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const inviteLink = `${baseUrl}/join?token=${token}`

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: `${doctorName} te invitó a Calmaa`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <div style="margin-bottom:24px">
          <span style="background:#7c3aed;color:#fff;font-weight:700;font-size:18px;padding:6px 14px;border-radius:8px">Calmaa</span>
        </div>
        <h2 style="color:#1a1a2e;margin-bottom:8px">Hola ${firstName},</h2>
        <p style="color:#555;line-height:1.6">
          <strong>${doctorName}</strong> te invitó a usar Calmaa, la app para monitorear tu salud y mantener a tu médico informado de tu evolución.
        </p>
        <div style="margin:32px 0">
          <a href="${inviteLink}"
             style="background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">
            Aceptar invitación
          </a>
        </div>
        <p style="color:#999;font-size:12px">
          Este link es personal. Si no esperabas esta invitación podés ignorar este email.
        </p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}
