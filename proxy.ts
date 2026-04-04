import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Edge-compatible middleware
export const { auth: proxy } = NextAuth(authConfig)

export default proxy((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Protected routes
  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
  const isOnProfile = nextUrl.pathname.startsWith("/profile")
  const isOnApi = nextUrl.pathname.startsWith("/api") &&
    !nextUrl.pathname.startsWith("/api/auth") &&
    !nextUrl.pathname.startsWith("/api/verify-email")

  if ((isOnDashboard || isOnProfile || isOnApi) && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
    const newUrl = new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl.origin)
    return Response.redirect(newUrl)
  }

  return null
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/verify-email|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
