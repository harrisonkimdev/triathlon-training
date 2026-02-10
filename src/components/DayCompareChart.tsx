'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Session } from '@/lib/firebase'
import { formatScore } from '@/lib/scoring'

interface DayCompareChartProps {
  sessions: Session[]   // all sessions (all users, all dates)
  selectedDate: string  // e.g. "2025-02-10"
}

const COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#65a30d', '#ea580c', '#6366f1',
]

export function DayCompareChart({ sessions, selectedDate }: DayCompareChartProps) {
  // All users with sessions up to and including selectedDate
  const users = useMemo(() => {
    const set = new Set<string>()
    for (const s of sessions) if (s.sessionDate <= selectedDate) set.add(s.userName)
    return [...set].sort()
  }, [sessions, selectedDate])

  if (users.length === 0) return null

  // Pivot: [{ date: "2025-02-01", Alice: 500, Bob: 400 }, ...]
  const chartData = useMemo(() => {
    const byDate: Record<string, Record<string, number>> = {}
    for (const s of sessions) {
      if (s.sessionDate <= selectedDate) {
        byDate[s.sessionDate] ??= {}
        byDate[s.sessionDate][s.userName] = (byDate[s.sessionDate][s.userName] ?? 0) + s.score
      }
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, scores]) => ({ date, ...scores }))
  }, [sessions, selectedDate])

  return (
    <div className="pt-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Cumulative scores
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString()} />
          <Tooltip formatter={(v: number) => [formatScore(v), '']} />
          <Legend />
          {users.map((user, i) => (
            <Line
              key={user}
              type="monotone"
              dataKey={user}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
