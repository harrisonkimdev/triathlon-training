'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Session } from '@/lib/firebase'

interface PeriodChartProps {
  sessions: Session[]
  selectedUser: string
}

type Period = 'weekly' | 'monthly' | 'yearly'
type Metric = 'Score' | 'Swim (m)' | 'Bike (km)' | 'Run (km)'

const PERIODS: Period[] = ['weekly', 'monthly', 'yearly']
const METRICS: Metric[] = ['Score', 'Swim (m)', 'Bike (km)', 'Run (km)']

function getWeekKey(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const dayOfWeek = d.getDay() || 7  // Mon=1..Sun=7
  const monday = new Date(d)
  monday.setDate(d.getDate() - (dayOfWeek - 1))
  return monday.toISOString().split('T')[0]
}

function getGroupKey(dateStr: string, period: Period): string {
  if (period === 'yearly') return dateStr.slice(0, 4)
  if (period === 'monthly') return dateStr.slice(0, 7)
  return getWeekKey(dateStr)
}

export function PeriodChart({ sessions, selectedUser }: PeriodChartProps) {
  const [period, setPeriod] = useState<Period>('monthly')
  const [metric, setMetric] = useState<Metric>('Score')

  const chartData = useMemo(() => {
    const filtered = sessions.filter(
      s => selectedUser === 'all' || s.userName === selectedUser
    )

    const buckets = new Map<string, { score: number; swim: number; bike: number; run: number }>()
    for (const s of filtered) {
      const key = getGroupKey(s.sessionDate, period)
      const existing = buckets.get(key) ?? { score: 0, swim: 0, bike: 0, run: 0 }
      buckets.set(key, {
        score: existing.score + s.score,
        swim: existing.swim + s.swimmingMeters,
        bike: existing.bike + s.bikingKm,
        run: existing.run + s.runningKm,
      })
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        period: key,
        'Score': v.score,
        'Swim (m)': Math.round(v.swim),
        'Bike (km)': Math.round(v.bike * 10) / 10,
        'Run (km)': Math.round(v.run * 10) / 10,
      }))
  }, [sessions, selectedUser, period])

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">No sessions yet</p>
  }

  return (
    <div className="space-y-3">
      {/* Period toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
              period === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'Yearly'}
          </button>
        ))}
      </div>

      {/* Metric toggle */}
      <div className="flex flex-wrap gap-1.5">
        {METRICS.map(m => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              metric === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="period" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey={metric} fill="#2563eb" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
