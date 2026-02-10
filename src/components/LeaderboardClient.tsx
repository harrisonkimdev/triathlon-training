'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatScore } from '@/lib/scoring'

type UserStat = {
  id: string
  name: string
  weeklyScore: number
  totalMins: number
  totalDistanceKm: number
  longestActivityMins: number
  sessionCount: number
  weeklySessionCount: number
}

type Tab = 'score' | 'time' | 'distance' | 'longest'

const TABS: { key: Tab; label: string }[] = [
  { key: 'score', label: 'Weekly Score' },
  { key: 'time', label: 'Total Time' },
  { key: 'distance', label: 'Total Distance' },
  { key: 'longest', label: 'Longest' },
]

function formatMins(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

function formatKm(km: number): string {
  if (km >= 100) return `${km.toFixed(0)} km`
  return `${km.toFixed(1)} km`
}

function getWeekRange(): string {
  const now = new Date()
  const day = now.getDay()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - day)
  const saturday = new Date(sunday)
  saturday.setDate(sunday.getDate() + 6)

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(sunday)} – ${fmt(saturday)}`
}

export default function LeaderboardClient({ users }: { users: UserStat[] }) {
  const [tab, setTab] = useState<Tab>('score')
  const weekRange = getWeekRange()

  const ranked = [...users].sort((a, b) => {
    let diff = 0
    if (tab === 'score') diff = b.weeklyScore - a.weeklyScore
    else if (tab === 'time') diff = b.totalMins - a.totalMins
    else if (tab === 'distance') diff = b.totalDistanceKm - a.totalDistanceKm
    else if (tab === 'longest') diff = b.longestActivityMins - a.longestActivityMins
    // Tiebreak: fewer sessions wins
    return diff !== 0 ? diff : a.sessionCount - b.sessionCount
  })

  function getTabValue(user: UserStat): number {
    if (tab === 'score') return user.weeklyScore
    if (tab === 'time') return user.totalMins
    if (tab === 'distance') return user.totalDistanceKm
    if (tab === 'longest') return user.longestActivityMins
    return 0
  }

  function getValue(user: UserStat): { label: string; value: string } {
    if (tab === 'score') return { label: 'Weekly Score', value: formatScore(user.weeklyScore) }
    if (tab === 'time') return { label: 'Total Time', value: formatMins(user.totalMins) }
    if (tab === 'distance') return { label: 'Total Distance', value: formatKm(user.totalDistanceKm) }
    if (tab === 'longest') return { label: 'Longest Activity', value: formatMins(user.longestActivityMins) }
    return { label: '', value: '' }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Leaderboard</h1>

      {/* Week indicator */}
      {tab === 'score' && (
        <p className="text-sm text-gray-400">
          This week: {weekRange}
        </p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Rankings */}
      <div className="space-y-2">
        {ranked.map((user, i) => {
          const { label, value } = getValue(user)
          const userVal = getTabValue(user)

          // Compute dense rank: same value AND same sessionCount → tied
          const rank =
            ranked.filter(
              (u) => getTabValue(u) > userVal ||
                (getTabValue(u) === userVal && u.sessionCount < user.sessionCount)
            ).length + 1

          const medal =
            userVal === 0
              ? <span className="text-lg text-gray-300 w-8 flex items-center justify-center">—</span>
              : rank === 1
              ? <span className="text-2xl w-8 text-center">🥇</span>
              : rank === 2
              ? <span className="text-2xl w-8 text-center">🥈</span>
              : rank === 3
              ? <span className="text-2xl w-8 text-center">🥉</span>
              : <span className="text-xl font-bold text-gray-300 w-8 text-center">{rank}</span>

          return (
            <Link key={user.id} href={`/profile/${encodeURIComponent(user.name)}`}>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <span className="flex items-center justify-center w-8">
                  {medal}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs text-gray-500">
                    {tab === 'score' ? user.weeklySessionCount : user.sessionCount} sessions
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="text-lg font-bold text-blue-600">{value}</div>
                </div>
              </div>
            </Link>
          )
        })}

        {ranked.length === 0 && (
          <p className="text-center text-gray-400 py-8">No sessions recorded yet</p>
        )}
      </div>
    </div>
  )
}
