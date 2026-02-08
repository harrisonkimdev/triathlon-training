import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatScore } from '@/lib/scoring'
import { StreakBadge } from '@/components/StreakBadge'
import { ProgressChart } from '@/components/ProgressChart'
import { SessionCard } from '@/components/SessionCard'
import type { Session } from '@/lib/supabase'

interface Props {
  params: Promise<{ name: string }>
}

function calcStreak(sessions: Session[]): number {
  const dates = [...new Set(sessions.map((s) => s.session_date))].sort().reverse()
  if (dates.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  let current = today

  for (const date of dates) {
    if (date === current) {
      streak++
      const d = new Date(current)
      d.setDate(d.getDate() - 1)
      current = d.toISOString().split('T')[0]
    } else if (date < current) {
      break
    }
  }
  return streak
}

export default async function ProfilePage({ params }: Props) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('name', decodedName)
    .single()

  if (!user) notFound()

  const { data: sessions = [] } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('session_date', { ascending: false })

  const streak = calcStreak(sessions ?? [])

  // PRs
  const prScore = Math.max(...(sessions ?? []).map((s) => s.score), 0)
  const prSwim = Math.max(...(sessions ?? []).map((s) => s.swimming_meters), 0)
  const prBike = Math.max(...(sessions ?? []).map((s) => s.biking_km), 0)
  const prRun = Math.max(...(sessions ?? []).map((s) => s.running_km), 0)

  // Weekly totals (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekStr = weekAgo.toISOString().split('T')[0]
  const weekSessions = (sessions ?? []).filter((s) => s.session_date >= weekStr)
  const weeklySwim = weekSessions.reduce((a, s) => a + s.swimming_meters, 0)
  const weeklyBike = weekSessions.reduce((a, s) => a + s.biking_km, 0)
  const weeklyRun = weekSessions.reduce((a, s) => a + s.running_km, 0)

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{decodedName}</h1>
          <p className="text-sm text-gray-500">{sessions?.length ?? 0} sessions</p>
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* PRs */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Personal Records</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">Best Score</div>
            <div className="text-lg font-bold text-blue-700">{formatScore(prScore)}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">Best Swim</div>
            <div className="text-lg font-bold text-blue-700">{prSwim}m</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">Best Bike</div>
            <div className="text-lg font-bold text-blue-700">{prBike.toFixed(1)} km</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">Best Run</div>
            <div className="text-lg font-bold text-blue-700">{prRun.toFixed(1)} km</div>
          </div>
        </div>
      </section>

      {/* Weekly totals */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Last 7 Days</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500">🏊 Swim</div>
            <div className="font-bold">{weeklySwim}m</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500">🚴 Bike</div>
            <div className="font-bold">{weeklyBike.toFixed(1)} km</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500">🏃 Run</div>
            <div className="font-bold">{weeklyRun.toFixed(1)} km</div>
          </div>
        </div>
      </section>

      {/* Progress chart */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Score Progress</h2>
        <ProgressChart sessions={sessions ?? []} />
      </section>

      {/* Session history */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">History</h2>
        <div className="space-y-2">
          {(sessions ?? []).map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      </section>

      <Link href="/" className="block text-center text-sm text-blue-600 underline">
        ← New session
      </Link>
    </div>
  )
}
