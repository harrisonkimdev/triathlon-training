interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
      <span className="text-2xl">🔥</span>
      <div>
        <div className="text-xl font-bold text-orange-600">{streak}</div>
        <div className="text-xs text-orange-500">day streak</div>
      </div>
    </div>
  )
}
