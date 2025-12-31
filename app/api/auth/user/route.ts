import { getFirebaseAuth } from "@/lib/firebase/client"
import { userRolesDB, profilesDB } from "@/lib/firebase/database"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const auth = getFirebaseAuth()
    const currentUser = auth.currentUser

    if (!currentUser) {
      return NextResponse.json({ user: null })
    }

    // Fetch user role
    const roleData = await userRolesDB.getByUserId(currentUser.uid)

    // Fetch user profile
    const profile = await profilesDB.getById(currentUser.uid)

    const user = {
      id: currentUser.uid,
      name: profile?.full_name || currentUser.email?.split("@")[0] || "User",
      email: currentUser.email || "",
      role: roleData?.role || "staff",
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Auth user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
