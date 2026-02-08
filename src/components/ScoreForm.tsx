'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UnitToggle } from '@/components/UnitToggle'
import { calcScore, milesToKm, formatScore } from '@/lib/scoring'
import { supabase } from '@/lib/supabase'

export function ScoreForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [swimming, setSwimming] = useState('')
  const [biking, setBiking] = useState('')
  const [running, setRunning] = useState('')
  const [unit, setUnit] = useState<'miles' | 'km'>('km')
  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const swim = parseFloat(swimming) || 0
    const bike = parseFloat(biking) || 0
    const run = parseFloat(running) || 0
    const bikeKm = unit === 'miles' ? milesToKm(bike) : bike
    const runKm = unit === 'miles' ? milesToKm(run) : run
    setScore(calcScore(swim, bikeKm, runKm))
  }, [swimming, biking, running, unit])

  async function handleSave() {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    setSaving(true)
    setError('')

    try {
      const { data: user, error: userErr } = await supabase
        .from('users')
        .upsert({ name: name.trim() }, { onConflict: 'name' })
        .select()
        .single()

      if (userErr) throw userErr

      const swim = parseFloat(swimming) || 0
      const bike = parseFloat(biking) || 0
      const run = parseFloat(running) || 0
      const bikeKm = unit === 'miles' ? milesToKm(bike) : bike
      const runKm = unit === 'miles' ? milesToKm(run) : run

      const { data: session, error: sessionErr } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          swimming_meters: swim,
          biking_km: bikeKm,
          running_km: runKm,
          score: calcScore(swim, bikeKm, runKm),
        })
        .select()
        .single()

      if (sessionErr) throw sessionErr

      router.push(`/session/${session.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save session')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center">Triathlon Tracker</h1>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Your name</label>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      {/* Unit toggle — applies to biking & running */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-gray-500">Unit:</span>
        <UnitToggle value={unit} onChange={setUnit} />
      </div>

      {/* Swimming */}
      <div className="flex items-center gap-3">
        <label className="w-24 text-base font-medium text-gray-800">Swimming</label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={swimming}
          onChange={(e) => setSwimming(e.target.value)}
          className="h-12 text-base flex-1"
        />
        <span className="text-sm text-gray-500 w-10">meters</span>
      </div>

      {/* Biking */}
      <div className="flex items-center gap-3">
        <label className="w-24 text-base font-medium text-gray-800">Biking</label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={biking}
          onChange={(e) => setBiking(e.target.value)}
          className="h-12 text-base flex-1"
        />
        <span className="text-sm text-gray-500 w-10">{unit}</span>
      </div>

      {/* Running */}
      <div className="flex items-center gap-3">
        <label className="w-24 text-base font-medium text-gray-800">Running</label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={running}
          onChange={(e) => setRunning(e.target.value)}
          className="h-12 text-base flex-1"
        />
        <span className="text-sm text-gray-500 w-10">{unit}</span>
      </div>

      {/* Score display */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
        <span className="text-base font-medium text-gray-700">Your score</span>
        <span className="text-2xl font-bold text-blue-600">{formatScore(score)}</span>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="h-12 text-base font-semibold"
      >
        {saving ? 'Saving…' : 'Save Session'}
      </Button>

      <button
        type="button"
        onClick={() => router.push(`/profile/${encodeURIComponent(name.trim())}`)}
        className="text-sm text-blue-600 text-center underline"
        disabled={!name.trim()}
      >
        View my profile →
      </button>
    </div>
  )
}
