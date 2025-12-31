// Note: For server-side operations with Firebase Realtime Database,
// we'll use the admin SDK (configured separately in environment variables)
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth as getAdminAuth } from "firebase-admin/auth"
import { getDatabase as getAdminDatabase } from "firebase-admin/database"

let adminApp: ReturnType<typeof initializeApp> | null = null

export function getFirebaseAdminApp() {
  if (adminApp) {
    return adminApp
  }

  if (getApps().length > 0) {
    return getApps()[0]
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!serviceAccountJson) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable")
  }

  const serviceAccount = JSON.parse(serviceAccountJson)

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  })

  return adminApp
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp()
  return getAdminAuth(app)
}

export function getFirebaseAdminDatabase() {
  const app = getFirebaseAdminApp()
  return getAdminDatabase(app)
}

export const auth = getFirebaseAdminAuth()
