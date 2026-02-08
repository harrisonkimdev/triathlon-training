import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { BottomNav } from '@/components/BottomNav'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Triathlon Tracker',
  description: 'Track and score your triathlon training sessions',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Triathlon Tracker',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased bg-white`}>
          <div className="pb-16">{children}</div>
          <BottomNav />
        </body>
    </html>
  )
}
