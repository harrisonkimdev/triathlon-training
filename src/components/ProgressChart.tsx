'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Session } from '@/lib/supabase'

interface ProgressChartProps {
  sessions: Session[]
}

export function ProgressChart({ sessions }: ProgressChartProps) {
  const data = [...sessions]
    .sort((a, b) => a.session_date.localeCompare(b.session_date))
    .map((s) => ({
      date: s.session_date,
      Score: s.score,
      Swimming: s.swimming_meters,
      Biking: Math.round(s.biking_km * 10) / 10,
      Running: Math.round(s.running_km * 10) / 10,
    }))

  if (data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No sessions yet</p>
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Score" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
