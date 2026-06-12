'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Log = { pain_level: number; created_at: string }

type Props = {
  logs: Log[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm border"
      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
    >
      <p className="font-medium">{entry.fecha} · {entry.hora}</p>
      <p style={{ color: '#7c3aed' }}>Nivel de dolor: {payload[0].value}/10</p>
    </div>
  )
}

export default function PainChart({ logs }: Props) {
  const data = logs.map((log, i) => ({
    idx: i,
    fecha: new Date(log.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    hora: new Date(log.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    nivel: log.pain_level,
  }))

  if (data.length === 0) {
    return (
      <div
        className="h-48 flex items-center justify-center rounded-xl border"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sin registros en los últimos 7 días
        </p>
      </div>
    )
  }

  // Mostrar solo el primer tick de cada fecha única para no saturar el eje
  const tickIndices = data.reduce<number[]>((acc, d) => {
    if (acc.length === 0 || data[acc[acc.length - 1]].fecha !== d.fecha) acc.push(d.idx)
    return acc
  }, [])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="idx"
          type="number"
          domain={[0, data.length - 1]}
          ticks={tickIndices}
          tickFormatter={(i) => data[i]?.fecha ?? ''}
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="nivel"
          stroke="#7c3aed"
          strokeWidth={2.5}
          dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#7c3aed' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
