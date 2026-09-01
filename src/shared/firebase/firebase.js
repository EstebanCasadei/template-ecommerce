import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import clientConfig from '../../features/config/clientConfig.js'

function getFirebaseApp() {
  const config = clientConfig.firebase
  const isConfigured = config.apiKey && config.projectId
  if (!isConfigured) return null

  // getApps/getApp makes this HMR-safe: importing the module again during
  // Vite Fast Refresh won't throw "Firebase App already exists".
  return getApps().length === 0 ? initializeApp(config) : getApp()
}

const app = getFirebaseApp()

export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null
