import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatScore } from '@/lib/scoring'

export default async function LeaderboardPage() {
  // Get all users with their best score and total sessions
  const { data: users = [] } = await supabase.from('users').select('id, name')

  const userStats = await Promise.all(
    (users ?? []).map(async (user) => {
      const { data: sessions = [] } = await supabase
        .from('sessions')
        .select('score, swimming_meters, biking_miles, running_miles, session_date')
        .eq('user_id', user.id)

      const bestScore = Math.max(...(sessions ?? []).map((s) => s.score), 0)
      const totalScore = (sessions ?? []).reduce((a, s) => a + s.score, 0)
      const count = sessions?.length ?? 0

      return { ...user, bestScore, totalScore, count }
    })
  )

  const ranked = userStats.sort((a, b) => b.bestScore - a.bestScore)

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <Link href="/" className="text-sm text-blue-600 underline">Home</Link>
      </div>

      <div className="space-y-2">
        {ranked.map((user, i) => (
          <Link key={user.id} href={`/profile/${encodeURIComponent(user.name)}`}>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
              <span className="text-2xl font-bold text-gray-300 w-8">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </span>
              <div className="flex-1">
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-gray-500">{user.count} sessions</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Best Score</div>
                <div className="text-lg font-bold text-blue-600">{formatScore(user.bestScore)}</div>
              </div>
            </div>
          </Link>
        ))}

        {ranked.length === 0 && (
          <p className="text-center text-gray-400 py-8">No sessions recorded yet</p>
        )}
      </div>
    </div>
  )
}
