import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import DownloadButton from './DownloadButton'

type Props = { searchParams: Promise<{ token?: string }> }

export default async function JoinPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorScreen message="Link inválido. Pedile al médico que te reenvíe la invitación." />
  }

  let invitation: {
    first_name: string
    last_name: string
    email: string
    status: string
    doctor_id: string
  } | null = null
  let doctorFullName: string | null = null

  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('invitations')
      .select('first_name, last_name, email, status, doctor_id')
      .eq('token', token)
      .single()
    invitation = data

    if (data?.doctor_id) {
      const { data: doc } = await admin
        .from('doctors')
        .select('full_name')
        .eq('id', data.doctor_id)
        .single()
      doctorFullName = doc?.full_name ?? null
    }
  } catch {
    return <ErrorScreen message="No se pudo verificar la invitación." />
  }

  if (!invitation) {
    return <ErrorScreen message="Invitación no encontrada. El link puede haber expirado." />
  }

  if (invitation.status === 'accepted') {
    return (
      <Screen>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
            <svg className="w-7 h-7" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Ya activaste tu cuenta</h2>
          <p style={{ color: 'var(--text-muted)' }}>Abrí la app Calmaa para continuar.</p>
        </div>
      </Screen>
    )
  }

  if (invitation.status === 'expired') {
    return <ErrorScreen message="Esta invitación expiró. Pedile al médico que te reenvíe una nueva." />
  }

  const doctorName = doctorFullName ?? 'Tu médico'
  const downloadUrl = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL ?? '#'
  const isAppStore = downloadUrl.includes('apps.apple.com')

  return (
    <Screen>
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white font-bold text-2xl"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          C
        </div>

        <p className="text-sm font-medium mb-1" style={{ color: 'var(--accent)' }}>
          Invitación personal
        </p>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Hola, {invitation.first_name}
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text)' }}>{doctorName}</span> te invitó a usar Calmaa para monitorear tu salud y mantenerlo informado de tu evolución.
        </p>

        {downloadUrl === '#' ? (
          <div
            className="rounded-xl border p-4 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            La app estará disponible próximamente en el App Store.
          </div>
        ) : (
          <DownloadButton url={downloadUrl} />
        )}
      </div>
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {children}
        </div>
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          © Calmaa · Monitoreo de salud
        </p>
      </div>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <Screen>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <svg className="w-6 h-6" style={{ color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      </div>
    </Screen>
  )
}
