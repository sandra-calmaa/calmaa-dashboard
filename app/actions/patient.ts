'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function dischargePatient(patientId: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('patients')
    .update({ active: false })
    .eq('id', patientId)
    .eq('doctor_id', user.id)

  if (error) return { error: 'No se pudo dar de alta al paciente' }

  redirect('/')
}
