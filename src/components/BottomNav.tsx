'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const path = usePathname()

  const links = [
    { href: '/', label: 'Log', icon: '➕' },
    { href: '/leaderboard', label: 'Board', icon: '🏆' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
      {links.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
            path === href ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">{icon}</span>
          {label}
        </Link>
      ))}
    </nav>
  )
}
