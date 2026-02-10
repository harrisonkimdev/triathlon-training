import { initializeApp } from 'firebase/app'
import { getFirestore, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Type definitions
export type User = {
  id: string
  name: string
  nameLower: string
  createdAt: Date
}

export type Session = {
  id: string
  userId: string
  userName: string
  swimmingMeters: number
  bikingKm: number
  runningKm: number
  score: number
  sessionDate: string
  createdAt: Date
  user?: User // For joined queries (if needed)
}

// Helper to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  return new Date(timestamp)
}
