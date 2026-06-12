'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { invitePatient, type InviteResult } from './actions'

function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors"
        style={{
          backgroundColor: 'var(--surface-2)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

export default function InvitePage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InviteResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await invitePatient(firstName.trim(), lastName.trim(), email.trim())
    setResult(res)
    setLoading(false)
    if (res.ok) {
      setFirstName('')
      setLastName('')
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Header />

      <main className="max-w-lg mx-auto px-6 py-10">
        <Link
          href="/"
          className="text-sm mb-6 inline-flex items-center gap-1.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a mis pacientes
        </Link>

        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Invitar paciente
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            El paciente recibirá un email para crear su cuenta en Calmaa.
          </p>

          {result?.ok ? (
            <div className="space-y-3">
              <div
                className="rounded-xl border p-5 text-sm"
                style={{
                  backgroundColor: 'rgba(34,197,94,0.08)',
                  borderColor: 'rgba(34,197,94,0.25)',
                }}
              >
                <p className="font-semibold mb-0.5" style={{ color: '#22c55e' }}>
                  Invitación registrada
                </p>
                <p style={{ color: 'var(--text-muted)' }}>
                  {result.emailSent
                    ? <>Se envió un email de invitación a <span style={{ color: 'var(--text)' }}>{result.email}</span>.</>
                    : <>La invitación fue guardada para <span style={{ color: 'var(--text)' }}>{result.email}</span>, pero el email no pudo enviarse.</>}
                </p>
              </div>

              {result.emailError && (
                <div
                  className="rounded-xl border p-4 text-xs"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    borderColor: 'rgba(239,68,68,0.25)',
                    color: '#f87171',
                  }}
                >
                  <p className="font-semibold mb-1">Error al enviar el email:</p>
                  <p style={{ color: 'var(--text-muted)' }}>{result.emailError}</p>
                  <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
                    Asegurate de tener <code style={{ color: 'var(--text)' }}>SUPABASE_SERVICE_ROLE_KEY</code> configurado en <code style={{ color: 'var(--text)' }}>.env.local</code>.
                  </p>
                </div>
              )}

              <button
                onClick={() => setResult(null)}
                className="text-sm font-medium underline"
                style={{ color: 'var(--accent)' }}
              >
                Invitar otro paciente
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="firstName"
                  label="Nombre"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="María"
                  required
                />
                <InputField
                  id="lastName"
                  label="Apellido"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="González"
                  required
                />
              </div>

              <InputField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="paciente@email.com"
                required
              />

              {result && !result.ok && (
                <p
                  className="text-sm rounded-lg px-3 py-2 border"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    borderColor: 'rgba(239,68,68,0.25)',
                    color: '#f87171',
                  }}
                >
                  {result.error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all mt-2 disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={(e) =>
                  !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')
                }
                onMouseLeave={(e) =>
                  !loading && (e.currentTarget.style.backgroundColor = 'var(--accent)')
                }
              >
                {loading ? 'Enviando invitación…' : 'Enviar invitación'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
