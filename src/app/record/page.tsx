'use client'

import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db, timestampToDate } from '@/lib/firebase'
import type { Session } from '@/lib/firebase'
import { SessionCard } from '@/components/SessionCard'
import { CalendarGrid } from '@/components/CalendarGrid'
import { DayCompareChart } from '@/components/DayCompareChart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function RecordPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, 'sessions'))
      const data: Session[] = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToDate(doc.data().createdAt),
      })) as Session[]
      setSessions(data)
      setLoading(false)
    }
    load()
  }, [])

  const userNames = useMemo(() => {
    return [...new Set(sessions.map(s => s.userName))].sort()
  }, [sessions])

  const visibleSessions = useMemo(() => {
    return sessions
      .filter(s => selectedUser === 'all' || s.userName === selectedUser)
      .filter(s => !selectedDate || s.sessionDate === selectedDate)
      .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
  }, [sessions, selectedUser, selectedDate])

  function handleSelectDate(date: string) {
    setSelectedDate(prev => prev === date ? null : date)
  }

  function handleUserChange(value: string) {
    setSelectedUser(value)
    setSelectedDate(null)
  }

  return (
    <div className="max-w-md mx-auto p-6 pb-24 space-y-4">
      <h1 className="text-2xl font-bold">Record</h1>

      {/* User filter */}
      <Select value={selectedUser} onValueChange={handleUserChange}>
        <SelectTrigger className="w-full h-10">
          <SelectValue placeholder="All athletes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All athletes</SelectItem>
          {userNames.map(name => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading…</p>
      ) : (
        <>
          <CalendarGrid
            sessions={sessions}
            selectedUser={selectedUser}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          {selectedDate && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {selectedDate}
              </h2>

              <DayCompareChart sessions={sessions} selectedDate={selectedDate} />

              {visibleSessions.length > 0 ? (
                visibleSessions.map(s => <SessionCard key={s.id} session={s} />)
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No sessions on this date</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
