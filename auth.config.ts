import type { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

// Edge-safe auth config - NO database/Prisma imports
// Database operations are handled in auth.ts via lazy imports
export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnApi = nextUrl.pathname.startsWith("/api") && !nextUrl.pathname.startsWith("/api/auth")

      if (isOnDashboard || isOnApi) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      return true
    },
    jwt({ token, user, trigger, session }) {
      // Add user id to token on sign in
      if (user) {
        token.id = user.id
        token.isPro = user.isPro
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name
        token.email = session.email
        token.image = session.image
      }

      return token
    },
    session({ session, token }) {
      // Add user data from token to session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.isPro = token.isPro as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig
