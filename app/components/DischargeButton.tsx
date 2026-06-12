'use client'

import { useState } from 'react'
import { dischargePatient } from '@/app/actions/patient'

type Props = { patientId: string; patientName: string }

export default function DischargeButton({ patientId, patientName }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDischarge() {
    setLoading(true)
    setError('')
    const result = await dischargePatient(patientId)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      setConfirming(false)
    }
    // Si no hay error, redirect() navega automáticamente al dashboard
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm px-4 py-2 rounded-lg border transition-colors"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#f87171'
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)'
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        Dar de alta
      </button>
    )
  }

  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(239,68,68,0.3)' }}
    >
      <p className="text-sm mb-1 font-medium" style={{ color: 'var(--text)' }}>
        ¿Dar de alta a {patientName}?
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        El paciente quedará inactivo y se liberará un slot de tu plan. Podrás reinvitarlo en el futuro.
      </p>

      {error && (
        <p
          className="text-xs rounded-lg px-3 py-2 border mb-3"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.25)',
            color: '#f87171',
          }}
        >
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="flex-1 py-2 rounded-lg text-sm border transition-colors disabled:opacity-50"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleDischarge}
          disabled={loading}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
          style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          {loading ? 'Procesando…' : 'Confirmar alta'}
        </button>
      </div>
    </div>
  )
}
