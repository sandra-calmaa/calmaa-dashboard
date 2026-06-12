import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import InvitationList from '@/app/components/InvitationList'

type PainLog = { pain_level: number; created_at: string }
type Patient = { id: string; full_name: string; pain_logs: PainLog[] }

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  growth: 'Growth',
  enterprise: 'Enterprise',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function painColor(level: number) {
  if (level <= 3) return '#22c55e'
  if (level <= 6) return '#f59e0b'
  return '#ef4444'
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, plan, max_patients')
    .eq('id', user!.id)
    .single()

  if (!doctor) redirect('/onboarding')

  const [{ data: patients }, { data: pendingInvitations }] = await Promise.all([
    supabase
      .from('patients')
      .select('*, pain_logs(pain_level, created_at)')
      .eq('doctor_id', user!.id)
      .eq('active', true)
      .order('created_at', { referencedTable: 'pain_logs', ascending: false }),
    supabase
      .from('invitations')
      .select('id, first_name, last_name, email, created_at')
      .eq('doctor_id', user!.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ])

  const rows: Patient[] = patients ?? []
  const patientCount = rows.length
  const maxPatients: number | null = doctor.max_patients ?? null
  const atLimit = maxPatients !== null && patientCount >= maxPatients
  const planLabel = PLAN_LABELS[doctor.plan ?? 'free'] ?? doctor.plan ?? 'Free'

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Plan banner */}
        <div
          className="rounded-xl border px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Plan {planLabel}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {maxPatients === null
                ? `${patientCount} paciente${patientCount !== 1 ? 's' : ''}`
                : `${patientCount}/${maxPatients} paciente${maxPatients !== 1 ? 's' : ''}`}
            </span>
          </div>

          {atLimit ? (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Actualizá tu plan para agregar más pacientes
            </span>
          ) : (
            <Link
              href="/invite"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={undefined}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invitar paciente
            </Link>
          )}
        </div>

        <InvitationList invitations={pendingInvitations ?? []} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Mis pacientes
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {rows.length} paciente{rows.length !== 1 ? 's' : ''} activo{rows.length !== 1 ? 's' : ''}
          </p>
        </div>

        {rows.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <p style={{ color: 'var(--text-muted)' }}>
              No hay pacientes activos.{' '}
              {!atLimit && (
                <Link href="/invite" style={{ color: 'var(--accent)' }}>
                  Invitar el primero
                </Link>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((patient) => {
              const latestLog = patient.pain_logs?.[0] ?? null
              return (
                <Link key={patient.id} href={`/patients/${patient.id}`} className="block group">
                  <div
                    className="rounded-xl border px-6 py-4 flex items-center justify-between transition-colors"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        {patient.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          {patient.full_name}
                        </p>
                        {latestLog ? (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Último registro: {formatDate(latestLog.created_at)}
                          </p>
                        ) : (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Sin registros
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {latestLog ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: painColor(latestLog.pain_level) }}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: painColor(latestLog.pain_level) }}
                          >
                            {latestLog.pain_level}/10
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          —
                        </span>
                      )}
                      <svg
                        className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--accent)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
