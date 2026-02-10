'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { db, timestampToDate } from '@/lib/firebase'
import type { Session } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot } from 'firebase/firestore'

interface ProgressChartProps {
  initialSessions: Session[]
  userId: string
}

const PAGE_SIZE = 5
const BAR_WIDTH = 60 // px per data point

export function ProgressChart({ initialSessions, userId }: ProgressChartProps) {
  const [sessions, setSessions] = useState<Session[]>(() =>
    [...initialSessions].sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
  )
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialSessions.length >= PAGE_SIZE)
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const loadedOnce = useRef(false)

  // Store the last doc snapshot for cursor-based pagination
  // We need to fetch the actual Firestore doc for the cursor
  const fetchOlderSessions = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      const sessionsRef = collection(db, 'sessions')
      let q
      if (lastDocRef.current) {
        q = query(
          sessionsRef,
          where('userId', '==', userId),
          orderBy('sessionDate', 'desc'),
          startAfter(lastDocRef.current),
          limit(PAGE_SIZE)
        )
      } else {
        // First load: skip the already-loaded sessions by using the oldest date as cursor
        const oldest = sessions[0] // sessions are sorted asc, so [0] is oldest
        q = query(
          sessionsRef,
          where('userId', '==', userId),
          orderBy('sessionDate', 'desc'),
          limit(PAGE_SIZE * 2) // fetch more to find docs beyond what we have
        )
        const snap = await getDocs(q)
        // Filter out already-loaded IDs
        const loadedIds = new Set(sessions.map((s) => s.id))
        const newDocs = snap.docs.filter((d) => !loadedIds.has(d.id))

        if (newDocs.length === 0) {
          setHasMore(false)
          setLoading(false)
          return
        }

        lastDocRef.current = snap.docs[snap.docs.length - 1]

        const newSessions: Session[] = newDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: timestampToDate(doc.data().createdAt),
        })) as Session[]

        setSessions((prev) =>
          [...newSessions, ...prev].sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
        )
        setHasMore(newDocs.length >= PAGE_SIZE)
        setLoading(false)
        return
      }

      const snap = await getDocs(q)
      if (snap.empty) {
        setHasMore(false)
        setLoading(false)
        return
      }

      lastDocRef.current = snap.docs[snap.docs.length - 1]
      const newSessions: Session[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToDate(doc.data().createdAt),
      })) as Session[]

      setSessions((prev) =>
        [...newSessions, ...prev].sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
      )
      setHasMore(snap.docs.length >= PAGE_SIZE)
    } catch (e) {
      console.error('Failed to load older sessions', e)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, userId, sessions])

  // Scroll to the right (latest) on initial render
  useEffect(() => {
    if (scrollRef.current && !loadedOnce.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
      loadedOnce.current = true
    }
  }, [sessions])

  // Detect scroll to left edge → load more
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollLeft < 40 && hasMore && !loading) {
      const prevScrollWidth = el.scrollWidth
      fetchOlderSessions().then(() => {
        // Maintain scroll position after prepending data
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth - prevScrollWidth
          }
        })
      })
    }
  }, [fetchOlderSessions, hasMore, loading])

  const data = sessions.map((s) => ({
    date: s.sessionDate.slice(5), // MM-DD
    Score: s.score,
  }))

  if (data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No sessions yet</p>
  }

  const chartWidth = data.length * BAR_WIDTH

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div style={{ width: `max(${chartWidth}px, 100%)`, height: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="Score" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {loading && (
        <p className="text-xs text-gray-400 text-center mt-1">Loading...</p>
      )}
      {!hasMore && sessions.length > PAGE_SIZE && (
        <p className="text-xs text-gray-300 text-center mt-1">All sessions loaded</p>
      )}
    </div>
  )
}
