'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PainChart from './PainChart'
import DoctorNotes from './DoctorNotes'
import DischargeButton from './DischargeButton'

type PainLog = { pain_level: number; created_at: string }
type Questionnaire = { sleep: number; mood: number; activity: number; created_at: string } | null
type Note = { id: string; note: string; created_at: string }
type Patient = { id: string; full_name: string }

type Props = {
  patient: Patient
  initialPainLogs: PainLog[]
  latestQuestionnaire: Questionnaire
  initialNotes: Note[]
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          {value}/10
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function PatientRealtimeData({
  patient,
  initialPainLogs,
  latestQuestionnaire,
  initialNotes,
}: Props) {
  const [painLogs, setPainLogs] = useState<PainLog[]>(initialPainLogs)
  const [currentLevel, setCurrentLevel] = useState<number | null>(
    initialPainLogs.length > 0 ? initialPainLogs[initialPainLogs.length - 1].pain_level : null
  )

  useEffect(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const channel = supabase
      .channel(`patient-${patient.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pain_logs',
          filter: `patient_id=eq.${patient.id}`,
        },
        (payload) => {
          const newLog = payload.new as PainLog
          const logDate = new Date(newLog.created_at)
          setCurrentLevel(newLog.pain_level)
          if (logDate >= sevenDaysAgo) {
            setPainLogs((prev) =>
              [...prev, newLog].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patient.id])

  function painColor(level: number) {
    if (level <= 3) return '#22c55e'
    if (level <= 6) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm mb-4 inline-flex items-center gap-1.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a mis pacientes
        </Link>

        <div className="flex items-center gap-4 mt-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {patient.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {patient.full_name}
            </h1>
            {currentLevel !== null && (
              <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: painColor(currentLevel) }}
                />
                Dolor actual:{' '}
                <span className="font-semibold" style={{ color: painColor(currentLevel) }}>
                  {currentLevel}/10
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <Section title="Evolución del dolor — últimos 7 días">
          <PainChart logs={painLogs} />
        </Section>

        <Section title="Último cuestionario de síntomas">
          {latestQuestionnaire ? (
            <div className="space-y-4">
              <ScoreBar label="Calidad del sueño" value={latestQuestionnaire.sleep} />
              <ScoreBar label="Estado de ánimo" value={latestQuestionnaire.mood} />
              <ScoreBar label="Nivel de actividad" value={latestQuestionnaire.activity} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Registrado:{' '}
                {new Date(latestQuestionnaire.created_at).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              El paciente no ha completado ningún cuestionario aún.
            </p>
          )}
        </Section>

        <Section title="Notas del médico">
          <DoctorNotes patientId={patient.id} initialNotes={initialNotes} />
        </Section>

        <div className="flex justify-end pt-2">
          <DischargeButton patientId={patient.id} patientName={patient.full_name} />
        </div>
      </div>
    </div>
  )
}
