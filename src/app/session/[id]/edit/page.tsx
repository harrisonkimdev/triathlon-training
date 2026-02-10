'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db, timestampToDate } from '@/lib/firebase'
import type { Session } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UnitToggle } from '@/components/UnitToggle'
import { calcScore, kmToMiles, milesToKm, formatScore } from '@/lib/scoring'
import { useAuth } from '@/context/AuthContext'

export default function EditSessionPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  const [sessionDate, setSessionDate] = useState('')
  const [swimming, setSwimming] = useState('')
  const [biking, setBiking] = useState('')
  const [running, setRunning] = useState('')
  const [swimmingMins, setSwimmingMins] = useState('')
  const [bikingMins, setBikingMins] = useState('')
  const [runningMins, setRunningMins] = useState('')
  const [unit, setUnit] = useState<'miles' | 'km'>('miles')

  const score = calcScore(
    parseFloat(swimming) || 0,
    unit === 'miles' ? milesToKm(parseFloat(biking) || 0) : (parseFloat(biking) || 0),
    unit === 'miles' ? milesToKm(parseFloat(running) || 0) : (parseFloat(running) || 0),
  )

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'sessions', id))
      if (!snap.exists()) { setLoading(false); return }
      const data = snap.data()
      const s = { id: snap.id, ...data, createdAt: timestampToDate(data.createdAt) } as Session
      setSession(s)
      setSessionDate(s.sessionDate)
      setSwimming(String(s.swimmingMeters))
      setBiking(String(s.bikingKm))
      setRunning(String(s.runningKm))
      setSwimmingMins(s.swimmingMins ? String(s.swimmingMins) : '10')
      setBikingMins(s.bikingMins ? String(s.bikingMins) : '25')
      setRunningMins(s.runningMins ? String(s.runningMins) : '15')
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    if (!session) return
    if (!user) { setError('You must be logged in to edit sessions'); return }
    if (session.userId !== user.uid) { setError('You can only edit your own sessions'); return }
    setSaving(true)
    setError('')
    try {
      const swim = parseFloat(swimming) || 0
      const bikeKm = unit === 'miles' ? milesToKm(parseFloat(biking) || 0) : (parseFloat(biking) || 0)
      const runKm = unit === 'miles' ? milesToKm(parseFloat(running) || 0) : (parseFloat(running) || 0)
      await updateDoc(doc(db, 'sessions', id), {
        sessionDate,
        swimmingMeters: swim,
        bikingKm: bikeKm,
        runningKm: runKm,
        swimmingMins: parseFloat(swimmingMins) || 0,
        bikingMins: parseFloat(bikingMins) || 0,
        runningMins: parseFloat(runningMins) || 0,
        score: calcScore(swim, bikeKm, runKm),
      })
      router.push(`/session/${id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!session) return
    setDeleting(true)
    setError('')
    try {
      await deleteDoc(doc(db, 'sessions', id))
      router.push(`/profile/${encodeURIComponent(session.userName)}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-400">Loading…</div>
  if (!session) return <div className="p-6 text-center text-gray-400">Session not found</div>

  // Only allow editing your own sessions
  if (user && session.userId !== user.uid) {
    return <div className="p-6 text-center text-gray-400">You can only edit your own sessions</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-sm text-gray-400">← Back</button>
        <h1 className="text-xl font-bold flex-1 text-center">Edit Session</h1>
      </div>

      {/* Date picker */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={sessionDate}
          onChange={e => setSessionDate(e.target.value)}
          className="h-12 rounded-md border border-input bg-background px-3 py-2 text-base"
        />
      </div>

      {/* Unit toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-gray-500">Unit:</span>
        <UnitToggle value={unit} onChange={(u) => {
          if (u === 'miles') {
            setBiking(v => v ? String(kmToMiles(parseFloat(v))) : v)
            setRunning(v => v ? String(kmToMiles(parseFloat(v))) : v)
          } else {
            setBiking(v => v ? String(milesToKm(parseFloat(v))) : v)
            setRunning(v => v ? String(milesToKm(parseFloat(v))) : v)
          }
          setUnit(u)
        }} />
      </div>

      {/* Swimming */}
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-gray-800">Swimming</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={swimming}
            onChange={e => setSwimming(e.target.value)}
            className="h-12 text-base flex-1"
          />
          <span className="text-sm text-gray-500 w-14">meters</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={swimmingMins}
            onChange={e => setSwimmingMins(e.target.value)}
            className="h-12 text-base w-20"
          />
          <span className="text-sm text-gray-500 w-8">min</span>
        </div>
      </div>

      {/* Biking */}
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-gray-800">Biking</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={biking}
            onChange={e => setBiking(e.target.value)}
            className="h-12 text-base flex-1"
          />
          <span className="text-sm text-gray-500 w-14">{unit}</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={bikingMins}
            onChange={e => setBikingMins(e.target.value)}
            className="h-12 text-base w-20"
          />
          <span className="text-sm text-gray-500 w-8">min</span>
        </div>
      </div>

      {/* Running */}
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-gray-800">Running</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={running}
            onChange={e => setRunning(e.target.value)}
            className="h-12 text-base flex-1"
          />
          <span className="text-sm text-gray-500 w-14">{unit}</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={runningMins}
            onChange={e => setRunningMins(e.target.value)}
            className="h-12 text-base w-20"
          />
          <span className="text-sm text-gray-500 w-8">min</span>
        </div>
      </div>

      {/* Score preview */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
        <span className="text-base font-medium text-gray-700">Score</span>
        <span className="text-2xl font-bold text-blue-600">{formatScore(score)}</span>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button onClick={handleSave} disabled={saving || deleting} className="h-12 text-base font-semibold">
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={saving || deleting}
        className="w-full h-12 border border-red-200 text-red-500 rounded-lg text-base font-medium hover:bg-red-50 disabled:opacity-50"
      >
        Delete Session
      </button>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-center">Delete Session?</h2>
            <p className="text-sm text-gray-500 text-center">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-12 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-12 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
