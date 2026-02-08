import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  name: string
  created_at: string
}

export type Session = {
  id: string
  user_id: string
  swimming_meters: number
  biking_km: number
  running_km: number
  score: number
  session_date: string
  created_at: string
  users?: User
}
