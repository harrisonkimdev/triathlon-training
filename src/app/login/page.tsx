'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, query, collection, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required')
      return
    }
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Name is required')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }
    setLoading(true)

    const email = `${username.trim().toLowerCase()}@triathlon.local`

    try {
      if (mode === 'signup') {
        // Check username uniqueness in Firestore
        const q = query(collection(db, 'users'), where('username', '==', username.trim().toLowerCase()))
        const snap = await getDocs(q)
        if (!snap.empty) {
          setError('Username already taken')
          setLoading(false)
          return
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'users', cred.user.uid), {
          username: username.trim().toLowerCase(),
          name: name.trim(),
          nameLower: name.trim().toLowerCase(),
          createdAt: serverTimestamp(),
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push('/')
    } catch (e: unknown) {
      if (e instanceof Error) {
        const code = (e as any).code
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          setError('Invalid username or password')
        } else if (code === 'auth/weak-password') {
          setError('Password must be at least 6 characters')
        } else {
          setError(e.message)
        }
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto pt-16">
      <h1 className="text-2xl font-bold text-center">Triathlon Tracker</h1>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {(['signin', 'signup'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            {m === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {/* Username */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Username</label>
        <Input
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          className="h-12 text-base"
        />
      </div>

      {/* Name (signup only) */}
      {mode === 'signup' && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Display Name</label>
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-12 text-base"
          />
        </div>
      )}

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      {/* Confirm password (signup only) */}
      {mode === 'signup' && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Confirm Password</label>
          <Input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="h-12 text-base font-semibold"
      >
        {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </Button>
    </div>
  )
}
