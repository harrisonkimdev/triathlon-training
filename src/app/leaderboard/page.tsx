import { db, timestampToDate } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import LeaderboardClient from '@/components/LeaderboardClient'

function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, ...
  const sunday = new Date(now)
  sunday.setHours(0, 0, 0, 0)
  sunday.setDate(now.getDate() - day)

  const saturday = new Date(sunday)
  saturday.setDate(sunday.getDate() + 6)
  saturday.setHours(23, 59, 59, 999)

  return { start: sunday, end: saturday }
}

export default async function LeaderboardPage() {
  const sessionsRef = collection(db, 'sessions')
  const sessionsSnapshot = await getDocs(sessionsRef)

  const { start: weekStart, end: weekEnd } = getWeekBounds()

  // Group all sessions by user
  const userSessionsMap = new Map<string, any[]>()

  sessionsSnapshot.docs.forEach((doc) => {
    const data = doc.data()
    const userId = data.userId
    if (!userSessionsMap.has(userId)) {
      userSessionsMap.set(userId, [])
    }
    userSessionsMap.get(userId)!.push({
      id: doc.id,
      ...data,
      createdAt: timestampToDate(data.createdAt),
    })
  })

  const userStats = Array.from(userSessionsMap.entries()).map(([userId, sessions]) => {
    const userName = sessions[0]?.userName || 'Unknown'

    // Weekly sessions (by sessionDate string YYYY-MM-DD)
    const weeklySessions = sessions.filter((s) => {
      const d = new Date(s.sessionDate)
      return d >= weekStart && d <= weekEnd
    })
    const weeklyScore = weeklySessions.reduce((a, s) => a + (s.score ?? 0), 0)

    // All-time aggregates
    const totalMins = sessions.reduce((a, s) => {
      return a + (s.swimmingMins ?? 0) + (s.bikingMins ?? 0) + (s.runningMins ?? 0)
    }, 0)

    // Total distance: swimming (m→km) + biking (km) + running (km)
    const totalDistanceKm = sessions.reduce((a, s) => {
      return a + (s.swimmingMeters ?? 0) / 1000 + (s.bikingKm ?? 0) + (s.runningKm ?? 0)
    }, 0)

    // Longest single activity (in minutes)
    const longestActivityMins = sessions.reduce((max, s) => {
      const sessionMins = (s.swimmingMins ?? 0) + (s.bikingMins ?? 0) + (s.runningMins ?? 0)
      return Math.max(max, sessionMins)
    }, 0)

    return {
      id: userId,
      name: userName,
      weeklyScore,
      totalMins,
      totalDistanceKm,
      longestActivityMins,
      sessionCount: sessions.length,
      weeklySessionCount: weeklySessions.length,
    }
  })

  return <LeaderboardClient users={userStats} />
}
