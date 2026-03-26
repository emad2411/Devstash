import "next-auth"
import "next-auth/jwt"
import { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isPro: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isPro: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    isPro?: boolean
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    isPro: boolean
  }
}
