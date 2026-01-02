"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"

import { auth } from "@/lib/firebase/config"
import { userRolesDB, profilesDB } from "@/lib/firebase/database"
import type { User, UserRole } from "@/lib/firebase/types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 🔹 Fetch role safely
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      const roleRecord = await userRolesDB.getByUserId(userId)
      return roleRecord?.role ?? "staff"
    } catch (err) {
      console.error("Role fetch failed:", err)
      return "staff"
    }
  }, [])

  // 🔹 Build app-level user from Firebase user
  const buildUser = useCallback(
    async (firebaseUser: FirebaseUser): Promise<User> => {
      const [role, profile] = await Promise.all([
        fetchUserRole(firebaseUser.uid),
        profilesDB.getById(firebaseUser.uid),
      ])

      return {
        id: firebaseUser.uid,
        name:
          profile?.full_name?.trim()?.length > 0
            ? profile.full_name
            : firebaseUser.email?.split("@")[0] ?? "User",
        email: firebaseUser.email ?? "",
        role,
      }
    },
    [fetchUserRole]
  )

  // 🔹 Firebase is the single source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)

      try {
        if (firebaseUser) {
          const appUser = await buildUser(firebaseUser)
          setUser(appUser)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Auth state error:", err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [buildUser])

  // 🔹 Login (NO state mutation here)
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.replace("/dashboard")
      return { error: null }
    } catch (error: any) {
      return { error: error.message ?? "Login failed" }
    }
  }

  // 🔹 Logout (Firebase handles state)
  const logout = async () => {
    try {
      await signOut(auth)
      router.replace("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
