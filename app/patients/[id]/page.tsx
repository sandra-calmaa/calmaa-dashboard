import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import PatientRealtimeData from '@/app/components/PatientRealtimeData'

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [{ data: patient }, { data: painLogs }, { data: questionnaires }, { data: notes }] =
    await Promise.all([
      supabase.from('patients').select('id, full_name').eq('id', id).single(),
      supabase
        .from('pain_logs')
        .select('pain_level, created_at')
        .eq('patient_id', id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('questionnaires')
        .select('sleep, mood, activity, created_at')
        .eq('patient_id', id)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('doctor_notes')
        .select('id, note, created_at')
        .eq('patient_id', id)
        .order('created_at', { ascending: false }),
    ])

  if (!patient) notFound()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Header />
      <PatientRealtimeData
        patient={patient}
        initialPainLogs={painLogs ?? []}
        latestQuestionnaire={questionnaires?.[0] ?? null}
        initialNotes={notes ?? []}
      />
    </div>
  )
}
