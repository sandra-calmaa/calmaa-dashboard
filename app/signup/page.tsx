'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      // Email confirmation disabled — already logged in
      router.push('/onboarding')
      router.refresh()
    } else {
      // Email confirmation required
      setCheckEmail(true)
      setLoading(false)
    }
  }

  if (checkEmail) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div className="w-full max-w-md text-center">
          <div
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(124,58,237,0.15)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Revisá tu email
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Enviamos un link de confirmación a{' '}
              <span style={{ color: 'var(--text)' }}>{email}</span>. Hacé click en el link para activar tu cuenta y continuar.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              C
            </div>
            <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
              Calmaa
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Creá tu cuenta de médico
          </p>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>
            Registro
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'fullName', label: 'Nombre completo', type: 'text', value: fullName, onChange: setFullName, placeholder: 'Dr. Juan Pérez' },
              { id: 'email', label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'doctor@clinica.com' },
              { id: 'password', label: 'Contraseña', type: 'password', value: password, onChange: setPassword, placeholder: '••••••••' },
            ].map(({ id, label, type, value, onChange, placeholder }) => (
              <div key={id}>
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
                  required
                  placeholder={placeholder}
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
            ))}

            {error && (
              <p className="text-sm bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2 text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all mt-2 disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: 'var(--text-muted)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--accent)' }}>
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
