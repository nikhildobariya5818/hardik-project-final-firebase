// app/api/staff/route.ts
import { profilesDB, userRolesDB } from "@/lib/firebase/database"
import { auth } from "@/lib/firebase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const authUsers = await auth.listUsers(1000)
    const staffList: any[] = []

    for (const authUser of authUsers.users) {
      const roleRecord = await userRolesDB.getByUserId(authUser.uid)
      const profile = await profilesDB.getById(authUser.uid)

      if (roleRecord && (roleRecord.role === "admin" || roleRecord.role === "staff")) {
        staffList.push({
          user_id: authUser.uid,
          id: authUser.uid,
          email: authUser.email,
          profile: {
            full_name: profile?.full_name || authUser.displayName || "Unknown",
            email: authUser.email,
          },
          role: roleRecord.role,
        })
      }
    }

    staffList.sort((a, b) =>
      (a.profile?.full_name || "").localeCompare(b.profile?.full_name || "")
    )

    return NextResponse.json({ data: staffList })
  } catch (error: any) {
    console.error("[v0] Staff GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Staff POST received:", body)

    const email = body.email
    const fullName = body.fullName || body.name
    const role = body.role || "staff"

    // Firebase requires password → auto-generate if missing
    const password =
      body.password || `Temp@${Math.random().toString(36).slice(-8)}`

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Email and full name are required" },
        { status: 400 }
      )
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
    })

    await profilesDB.create({
      user_id: userRecord.uid,
      full_name: fullName,
      email,
    })

    await userRolesDB.set(userRecord.uid, role)

    return NextResponse.json({
      data: {
        user_id: userRecord.uid,
        id: userRecord.uid,
        email,
        profile: {
          full_name: fullName,
          email,
        },
        role,
      },
    })
  } catch (error: any) {
    console.error("[v0] Staff POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 })
    }

    await auth.deleteUser(id)

    return NextResponse.json({ data: { success: true } })
  } catch (error: any) {
    console.error("[v0] Staff DELETE error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
