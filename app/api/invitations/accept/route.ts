import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  let token: string | undefined

  try {
    const body = await request.json()
    token = body.token
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ error: 'token requerido' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: invitation, error: fetchError } = await admin
    .from('invitations')
    .select('id, doctor_id, first_name, last_name, email, status')
    .eq('token', token)
    .single()

  if (fetchError || !invitation) {
    return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 })
  }

  if (invitation.status === 'accepted') {
    return NextResponse.json({ error: 'Invitación ya aceptada' }, { status: 409 })
  }

  if (invitation.status === 'expired') {
    return NextResponse.json({ error: 'Invitación expirada' }, { status: 410 })
  }

  // Create patient record
  const { data: patient, error: patientError } = await admin
    .from('patients')
    .insert({
      full_name: `${invitation.first_name} ${invitation.last_name}`,
      doctor_id: invitation.doctor_id,
      active: true,
    })
    .select('id')
    .single()

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 500 })
  }

  // Mark invitation as accepted
  await admin
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return NextResponse.json({
    ok: true,
    patient_id: patient.id,
    doctor_id: invitation.doctor_id,
  })
}
