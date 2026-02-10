import Link from 'next/link'
import type { Session } from '@/lib/firebase'
import { formatScore } from '@/lib/scoring'

interface SessionCardProps {
  session: Session
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/session/${session.id}`} className="block">
      <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-gray-400">{session.sessionDate}</div>
            <div className="text-sm mt-1 space-y-0.5 text-gray-600">
              <div>🏊 {session.swimmingMeters}m</div>
              <div>🚴 {session.bikingKm.toFixed(1)} km</div>
              <div>🏃 {session.runningKm.toFixed(1)} km</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Score</div>
            <div className="text-xl font-bold text-blue-600">{formatScore(session.score)}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
