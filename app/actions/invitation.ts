'use server'

import { createClient } from '@/lib/supabase-server'
import { sendInvitationEmail } from '@/lib/resend'
import { revalidatePath } from 'next/cache'

export async function deleteInvitation(
  invitationId: string
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error, data } = await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('id', invitationId)
    .eq('doctor_id', user.id)
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Sin permiso para eliminar — ejecutá la política UPDATE en Supabase' }

  revalidatePath('/')
  return { ok: true }
}

export async function resendInvitation(
  invitationId: string
): Promise<{ error: string } | { ok: true; emailSent: boolean; emailError?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const invRes = await supabase
    .from('invitations')
    .select('email, first_name, last_name')
    .eq('id', invitationId)
    .eq('doctor_id', user.id)
    .single()
  const docRes = await supabase.from('doctors').select('full_name').eq('id', user.id).single()
  const invitation = invRes.data
  const doctor = docRes.data

  if (!invitation) return { error: 'Invitación no encontrada' }

  const newToken = crypto.randomUUID()

  const { error: updateError } = await supabase
    .from('invitations')
    .update({ token: newToken, status: 'pending' })
    .eq('id', invitationId)
    .eq('doctor_id', user.id)

  if (updateError) return { error: updateError.message }

  let emailSent = false
  let emailError: string | undefined

  try {
    await sendInvitationEmail({
      to: invitation.email,
      firstName: invitation.first_name,
      lastName: invitation.last_name,
      doctorName: doctor?.full_name ?? user.email ?? 'Tu médico',
      token: newToken,
    })
    emailSent = true
  } catch (err: any) {
    emailError = err?.message ?? 'Error al enviar email'
  }

  revalidatePath('/')
  return { ok: true, emailSent, emailError }
}
