'use client'

import { useState } from 'react'
import { selectPlan } from './actions'

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    maxPatients: 1,
    tagline: 'Para explorar la plataforma',
    price: 'Gratis',
  },
  {
    id: 'starter',
    label: 'Starter',
    maxPatients: 5,
    tagline: 'Práctica pequeña',
    price: 'Próximamente',
  },
  {
    id: 'pro',
    label: 'Pro',
    maxPatients: 10,
    tagline: 'La más popular',
    price: 'Próximamente',
    featured: true,
  },
  {
    id: 'growth',
    label: 'Growth',
    maxPatients: 20,
    tagline: 'Para seguir creciendo',
    price: 'Próximamente',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    maxPatients: null,
    tagline: 'Sin límites',
    price: 'Próximamente',
  },
]

export default function PlanSelector() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    setError('')
    const result = await selectPlan(selected)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const selectedPlan = PLANS.find((p) => p.id === selected)

  return (
    <div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {PLANS.map((plan) => {
          const isSelected = selected === plan.id
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className="text-left rounded-xl border p-5 transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? 'rgba(124,58,237,0.12)' : 'var(--surface-2)',
                borderColor: isSelected ? 'var(--accent)' : plan.featured ? 'rgba(124,58,237,0.3)' : 'var(--border)',
                boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--accent)'
                      : plan.featured
                      ? 'rgba(124,58,237,0.2)'
                      : 'var(--surface)',
                    color: isSelected || plan.featured ? (isSelected ? '#fff' : 'var(--accent)') : 'var(--text-muted)',
                  }}
                >
                  {plan.label}
                </span>
                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-xl font-bold mb-0.5" style={{ color: 'var(--text)' }}>
                {plan.maxPatients === null ? '∞' : plan.maxPatients}
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                {plan.maxPatients === null ? 'pacientes ilimitados' : `paciente${plan.maxPatients !== 1 ? 's' : ''}`}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {plan.tagline}
              </p>
              <p
                className="text-xs font-semibold mt-2"
                style={{ color: plan.id === 'free' ? '#22c55e' : 'var(--text-muted)' }}
              >
                {plan.price}
              </p>
            </button>
          )
        })}
      </div>

      {error && (
        <p
          className="text-sm rounded-lg px-3 py-2 border mt-4"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.25)',
            color: '#f87171',
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={!selected || loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-5 disabled:opacity-40"
        style={{ backgroundColor: 'var(--accent)' }}
        onMouseEnter={(e) =>
          selected && !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')
        }
        onMouseLeave={(e) =>
          selected && !loading && (e.currentTarget.style.backgroundColor = 'var(--accent)')
        }
      >
        {loading
          ? 'Guardando…'
          : selectedPlan
          ? `Continuar con Plan ${selectedPlan.label}`
          : 'Seleccioná un plan para continuar'}
      </button>
    </div>
  )
}
