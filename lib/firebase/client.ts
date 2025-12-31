import { auth, database } from "./config"

export function getFirebaseAuth() {
  return auth
}

export function getFirebaseDatabase() {
  return database
}

export const firebaseClient = {
  auth,
  database,
}
