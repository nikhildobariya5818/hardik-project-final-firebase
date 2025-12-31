import { type NextRequest, NextResponse } from "next/server"
import { getFirebaseAdminAuth, getFirebaseAdminDatabase } from "@/lib/firebase/server"
import { ref, get, set } from "firebase/database"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Setup admin API called")

    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and fullName are required" }, { status: 400 })
    }

    const auth = getFirebaseAdminAuth()
    const database = getFirebaseAdminDatabase()

    console.log("[v0] Checking for existing admin")

    // Check if admin exists
    const existingAdminRef = ref(database, "user_roles")
    const snapshot = await get(existingAdminRef)
    let adminExists = false

    if (snapshot.exists()) {
      const userRoles = snapshot.val()
      for (const key in userRoles) {
        if (userRoles[key].role === "admin") {
          adminExists = true
          break
        }
      }
    }

    if (adminExists) {
      return NextResponse.json({ error: "Admin already exists. Use the normal login flow." }, { status: 400 })
    }

    console.log("[v0] Creating first admin user:", email)

    // Create user with Firebase Admin SDK
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
      emailVerified: true,
    })

    console.log("[v0] User created:", userRecord.uid)

    // Set admin role
    await set(ref(database, `user_roles/${userRecord.uid}`), {
      user_id: userRecord.uid,
      role: "admin",
      created_at: new Date().toISOString(),
    })

    // Create profile
    await set(ref(database, `profiles/${userRecord.uid}`), {
      user_id: userRecord.uid,
      full_name: fullName,
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    console.log("[v0] Admin user and role created successfully")

    return NextResponse.json({ success: true, message: "Admin account created successfully" })
  } catch (error: unknown) {
    console.error("[v0] Error in setup-admin:", error)
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
