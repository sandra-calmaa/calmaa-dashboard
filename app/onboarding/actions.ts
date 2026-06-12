'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

const MAX_PATIENTS: Record<string, number | null> = {
  free: 1,
  starter: 5,
  pro: 10,
  growth: 20,
  enterprise: null,
}

export async function selectPlan(plan: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('doctors').insert({
    id: user.id,
    email: user.email,
    plan,
    max_patients: MAX_PATIENTS[plan] ?? 1,
    full_name: user.user_metadata?.full_name ?? user.email,
  })

  if (error) return { error: error.message }

  redirect('/')
}
