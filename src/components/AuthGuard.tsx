'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login')
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading…</div>
  }

  if (!user && pathname !== '/login') {
    return null
  }

  return <>{children}</>
}
