'use server'

import { createClient } from '@/lib/supabase-server'
import { sendInvitationEmail } from '@/lib/resend'

export type InviteResult =
  | { ok: true; email: string; emailSent: boolean; emailError?: string }
  | { ok: false; error: string }

export async function invitePatient(
  firstName: string,
  lastName: string,
  email: string
): Promise<InviteResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'No autenticado' }

  const { data: doctor } = await supabase
    .from('doctors')
    .select('plan, max_patients, full_name')
    .eq('id', user.id)
    .single()

  if (!doctor) return { ok: false, error: 'Perfil de médico no encontrado' }

  if (doctor.max_patients !== null) {
    const { count } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .eq('active', true)

    if ((count ?? 0) >= doctor.max_patients) {
      return {
        ok: false,
        error: 'Límite de pacientes alcanzado. Actualizá tu plan para continuar.',
      }
    }
  }

  const { data: existing } = await supabase
    .from('invitations')
    .select('status')
    .eq('doctor_id', user.id)
    .eq('email', email)
    .in('status', ['pending', 'accepted'])
    .maybeSingle()

  if (existing) {
    if (existing.status === 'accepted')
      return { ok: false, error: 'Este paciente ya está activo en tu cuenta.' }
    return { ok: false, error: 'Ya existe una invitación pendiente para este email.' }
  }

  const token = crypto.randomUUID()
  const { error: insertError } = await supabase.from('invitations').insert({
    doctor_id: user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    status: 'pending',
    token,
  })

  if (insertError) return { ok: false, error: insertError.message }

  let emailSent = false
  let emailError: string | undefined

  try {
    await sendInvitationEmail({
      to: email,
      firstName,
      lastName,
      doctorName: doctor.full_name ?? user.email ?? 'Tu médico',
      token,
    })
    emailSent = true
  } catch (err: any) {
    emailError = err?.message ?? 'Error al enviar email'
  }

  return { ok: true, email, emailSent, emailError }
}
