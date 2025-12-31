"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
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

  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const roleRecord = await userRolesDB.getByUserId(userId)
      return roleRecord?.role ?? null
    } catch (error) {
      console.error("Error fetching role:", error)
      return null
    }
  }

  const buildUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    const role = await fetchUserRole(firebaseUser.uid)
    if (!role) return null

    const profile = await profilesDB.getById(firebaseUser.uid)

    return {
      id: firebaseUser.uid,
      name:
        profile?.full_name && profile.full_name.length > 0
          ? profile.full_name
          : (firebaseUser.email?.split("@")[0] ?? "User"),
      email: firebaseUser.email ?? "",
      role,
    }
  }

  useEffect(() => {
    let mounted = true

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return

      if (firebaseUser) {
        const builtUser = await buildUser(firebaseUser)
        setUser(builtUser)
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
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
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
