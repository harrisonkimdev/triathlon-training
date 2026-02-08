import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ShareCard } from '@/components/ShareCard'
import { ShareButton } from '@/components/ShareButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params

  const { data: session } = await supabase
    .from('sessions')
    .select('*, users(*)')
    .eq('id', id)
    .single()

  if (!session) notFound()

  const user = session.users as { id: string; name: string; created_at: string }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold text-center">Session Result</h1>

      <ShareCard session={session} user={user} />

      <ShareButton />

      <div className="flex gap-3">
        <Link href={`/profile/${encodeURIComponent(user.name)}`} className="flex-1">
          <button className="w-full h-10 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            My Profile
          </button>
        </Link>
        <Link href="/" className="flex-1">
          <button className="w-full h-10 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            New Session
          </button>
        </Link>
        <Link href="/leaderboard" className="flex-1">
          <button className="w-full h-10 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            Leaderboard
          </button>
        </Link>
      </div>
    </div>
  )
}
