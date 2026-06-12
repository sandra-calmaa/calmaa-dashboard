'use client'

import { useState } from 'react'
import { deleteInvitation, resendInvitation } from '@/app/actions/invitation'

type Invitation = {
  id: string
  first_name: string
  last_name: string
  email: string
  created_at: string
}

function InvitationRow({ inv }: { inv: Invitation }) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [resending, setResending] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteInvitation(inv.id)
    if ('error' in result) {
      setFeedback(`Error: ${result.error}`)
      setDeleting(false)
      setConfirmDelete(false)
    }
    // si ok:true, revalidatePath elimina la fila del DOM automáticamente
  }

  async function handleResend() {
    setResending(true)
    setFeedback(null)
    const result = await resendInvitation(inv.id)
    setResending(false)
    if ('error' in result) {
      setFeedback(`Error: ${result.error}`)
    } else if (result.emailSent) {
      setFeedback('Email reenviado correctamente')
    } else {
      setFeedback(`Email no enviado: ${result.emailError ?? 'error desconocido'}`)
    }
  }

  const initials = `${inv.first_name[0]}${inv.last_name[0]}`.toUpperCase()

  return (
    <div
      className="rounded-xl border px-5 py-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px dashed var(--border)' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {inv.first_name} {inv.last_name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {inv.email}
            </p>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full border ml-1"
            style={{
              color: '#f59e0b',
              borderColor: 'rgba(245,158,11,0.3)',
              backgroundColor: 'rgba(245,158,11,0.08)',
            }}
          >
            Pendiente
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!confirmDelete ? (
            <>
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
                style={{ color: 'var(--accent)', borderColor: 'rgba(124,58,237,0.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {resending ? 'Reenviando…' : 'Reenviar'}
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f87171'
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                Eliminar
              </button>
            </>
          ) : (
            <>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ¿Eliminar invitación?
              </span>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                {deleting ? 'Eliminando…' : 'Confirmar'}
              </button>
            </>
          )}
        </div>
      </div>

      {feedback && (
        <p
          className="text-xs mt-2 px-2"
          style={{ color: feedback.startsWith('Error') ? '#f87171' : '#22c55e' }}
        >
          {feedback}
        </p>
      )}
    </div>
  )
}

export default function InvitationList({ invitations }: { invitations: Invitation[] }) {
  if (invitations.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
        Invitaciones pendientes
      </h2>
      <div className="space-y-2">
        {invitations.map((inv) => (
          <InvitationRow key={inv.id} inv={inv} />
        ))}
      </div>
    </div>
  )
}
