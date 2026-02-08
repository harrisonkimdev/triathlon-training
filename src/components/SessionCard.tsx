import Link from 'next/link'
import type { Session } from '@/lib/supabase'
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
            <div className="text-xs text-gray-400">{session.session_date}</div>
            <div className="text-sm mt-1 space-y-0.5 text-gray-600">
              <div>🏊 {session.swimming_meters}m</div>
              <div>🚴 {session.biking_km.toFixed(1)} km</div>
              <div>🏃 {session.running_km.toFixed(1)} km</div>
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
