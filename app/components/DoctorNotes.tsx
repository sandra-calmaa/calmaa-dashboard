'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Note = { id: string; note: string; created_at: string }

type Props = {
  patientId: string
  initialNotes: Note[]
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DoctorNotes({ patientId, initialNotes }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [note, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('doctor_notes')
      .insert({ patient_id: patientId, doctor_id: user!.id, note: note.trim() })
      .select('id, note, created_at')
      .single()

    if (error) {
      console.error('doctor_notes insert error:', error.code, error.message, error.details, error.hint)
      setError('No se pudo guardar la nota.')
    } else if (data) {
      setNotes([data, ...notes])
      setContent('')
    }
    setSaving(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={note}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Escribí una nota clínica..."
          className="w-full rounded-xl border px-4 py-3 text-sm resize-none outline-none transition-colors"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={saving || !note.trim()}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {saving ? 'Guardando...' : 'Guardar nota'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aún no hay notas para este paciente.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border px-4 py-3"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                {note.note}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {formatDateTime(note.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
