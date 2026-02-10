import type { Session, User } from '@/lib/firebase'
import { formatScore } from '@/lib/scoring'

interface ShareCardProps {
  session: Session
  user: User
}

export function ShareCard({ session, user }: ShareCardProps) {
  return (
    <div
      id="share-card"
      className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 w-full max-w-sm mx-auto"
    >
      <div className="text-center mb-4">
        <div className="text-sm opacity-80">Triathlon Training</div>
        <div className="text-xl font-bold mt-1">{user.name}</div>
        <div className="text-sm opacity-70">{session.sessionDate}</div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center bg-white/20 rounded-lg px-4 py-2">
          <span>🏊 Swimming</span>
          <span className="font-bold">{session.swimmingMeters}m</span>
        </div>
        <div className="flex justify-between items-center bg-white/20 rounded-lg px-4 py-2">
          <span>🚴 Biking</span>
          <span className="font-bold">{session.bikingKm.toFixed(1)} km</span>
        </div>
        <div className="flex justify-between items-center bg-white/20 rounded-lg px-4 py-2">
          <span>🏃 Running</span>
          <span className="font-bold">{session.runningKm.toFixed(1)} km</span>
        </div>
      </div>

      <div className="text-center border-t border-white/30 pt-4">
        <div className="text-sm opacity-80">Total Score</div>
        <div className="text-4xl font-bold">{formatScore(session.score)}</div>
      </div>
    </div>
  )
}
