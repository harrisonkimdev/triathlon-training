'use client'

import { useState, useMemo } from 'react'
import type { Session } from '@/lib/firebase'

interface CalendarGridProps {
  sessions: Session[]
  selectedUser: string
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const AVATAR_COLORS = [
  'bg-blue-400', 'bg-green-500', 'bg-red-400', 'bg-amber-400',
  'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-lime-500',
]

export function CalendarGrid({ sessions, selectedUser, selectedDate, onSelectDate }: CalendarGridProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  // All users sorted — stable color assignment
  const allUsers = useMemo(() => {
    return [...new Set(sessions.map(s => s.userName))].sort()
  }, [sessions])

  // Map: date -> list of unique users who recorded on that date (filtered by selectedUser)
  const dateUsersMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const s of sessions) {
      if (selectedUser !== 'all' && s.userName !== selectedUser) continue
      if (!map[s.sessionDate]) map[s.sessionDate] = []
      if (!map[s.sessionDate].includes(s.userName)) {
        map[s.sessionDate].push(s.userName)
      }
    }
    return map
  }, [sessions, selectedUser])

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const padding: null[] = Array(firstDay).fill(null)
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1
      return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
    return [...padding, ...days]
  }, [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long', year: 'numeric',
  })

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">‹</button>
        <span className="font-semibold text-sm">{monthLabel}</span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`pad-${i}`} />

          const users = dateUsersMap[dateStr] ?? []
          const hasSession = users.length > 0
          const isSelected = dateStr === selectedDate
          const dayNum = parseInt(dateStr.slice(-2))

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors gap-0.5
                ${isSelected ? 'bg-blue-500 text-white' : hasSession ? 'hover:bg-blue-50' : 'hover:bg-gray-100'}
              `}
            >
              <span className="leading-none">{dayNum}</span>
              {hasSession && (
                <div className="flex gap-0.5 flex-wrap justify-center max-w-full px-0.5">
                  {users.slice(0, 3).map(user => {
                    const colorIdx = allUsers.indexOf(user)
                    const color = isSelected ? 'bg-white/80' : AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]
                    return (
                      <span
                        key={user}
                        title={user}
                        className={`w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold text-white ${color}`}
                      >
                        {user[0].toUpperCase()}
                      </span>
                    )
                  })}
                  {users.length > 3 && (
                    <span className={`text-[7px] leading-3 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      +{users.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
