import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check if Firebase is configured
  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

  if (!firebaseProjectId || !firebaseApiKey) {
    if (request.nextUrl.pathname === "/setup") {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/setup", request.url))
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // For server-side auth checks, you would need to verify the Firebase ID token
  // This is handled by the AuthContext on the client side

  // Public routes
  const publicRoutes = ["/", "/login", "/setup"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname === route)

  // Note: Actual authentication is handled by AuthContext on client
  // This middleware just redirects unauthenticated users away from protected routes
  // For full protection, implement Firebase ID token verification here if needed

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
