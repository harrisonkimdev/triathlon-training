import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db, timestampToDate } from '@/lib/firebase'
import type { Session } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { formatScore } from '@/lib/scoring'
import { StreakBadge } from '@/components/StreakBadge'
import { ProgressChart } from '@/components/ProgressChart'
import { SessionCard } from '@/components/SessionCard'

interface Props {
  params: Promise<{ name: string }>
}

function calcStreak(sessions: Session[]): number {
  const dates = [...new Set(sessions.map((s) => s.sessionDate))].sort().reverse()
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

  // Get user by name (case-insensitive)
  const usersRef = collection(db, 'users')
  const userQuery = query(usersRef, where('nameLower', '==', decodedName.toLowerCase()))
  const userSnapshot = await getDocs(userQuery)

  if (userSnapshot.empty) notFound()

  const userDoc = userSnapshot.docs[0]
  const user = { id: userDoc.id, ...userDoc.data() }

  // Get sessions for user (requires composite index)
  const sessionsRef = collection(db, 'sessions')
  const sessionsQuery = query(
    sessionsRef,
    where('userId', '==', userDoc.id),
    orderBy('sessionDate', 'desc')
  )
  const sessionsSnapshot = await getDocs(sessionsQuery)

  const sessions: Session[] = sessionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: timestampToDate(doc.data().createdAt),
  })) as Session[]

  const streak = calcStreak(sessions)

  // PRs
  const prScore = Math.max(...sessions.map((s) => s.score), 0)
  const prSwim = Math.max(...sessions.map((s) => s.swimmingMeters), 0)
  const prBike = Math.max(...sessions.map((s) => s.bikingKm), 0)
  const prRun = Math.max(...sessions.map((s) => s.runningKm), 0)

  // Weekly totals (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekStr = weekAgo.toISOString().split('T')[0]
  const weekSessions = sessions.filter((s) => s.sessionDate >= weekStr)
  const weeklySwim = weekSessions.reduce((a, s) => a + s.swimmingMeters, 0)
  const weeklyBike = weekSessions.reduce((a, s) => a + s.bikingKm, 0)
  const weeklyRun = weekSessions.reduce((a, s) => a + s.runningKm, 0)

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{decodedName}</h1>
          <p className="text-sm text-gray-500">{sessions.length} sessions</p>
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
        <ProgressChart sessions={sessions} />
      </section>

      {/* Session history */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">History</h2>
        <div className="space-y-2">
          {sessions.map((s) => (
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
