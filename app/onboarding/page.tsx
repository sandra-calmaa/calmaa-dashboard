import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PlanSelector from './PlanSelector'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('id', user.id)
    .single()

  if (doctor) redirect('/')

  const name = user.user_metadata?.full_name ?? user.email ?? 'médico'
  const firstName = name.split(' ')[0]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="border-b px-6 py-4 flex items-center"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            C
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Calmaa
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-sm mb-2" style={{ color: 'var(--accent)' }}>
            Paso 1 de 1 · Configuración inicial
          </p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Bienvenido, {firstName}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Elegí el plan que mejor se adapte a tu práctica. Podés cambiarlo en cualquier momento.
          </p>
        </div>

        <PlanSelector />
      </main>
    </div>
  )
}
