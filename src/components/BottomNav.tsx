'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function BottomNav() {
  const path = usePathname()
  const { user } = useAuth()

  const profileHref = user ? `/profile/${encodeURIComponent(user.name)}` : '/login'

  const links = [
    { href: profileHref, label: 'Profile', icon: '👤', match: '/profile' },
    { href: '/record', label: 'Record', icon: '📅', match: '/record' },
    { href: '/leaderboard', label: 'Board', icon: '🏆', match: '/leaderboard' },
  ]

  if (path === '/login') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
      {links.map(({ href, label, icon, match }) => (
        <Link
          key={label}
          href={href}
          className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
            path.startsWith(match) ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">{icon}</span>
          {label}
        </Link>
      ))}
    </nav>
  )
}
