# Phase 1: Core Auth Configuration

## Goal

Set up the foundational auth infrastructure with Edge-compatible configuration, Prisma adapter, and middleware.

## Dependencies

### Install packages

```bash
npm install next-auth@beta @auth/prisma-adapter zod
```

- `next-auth@beta` — Auth.js v5 for Next.js
- `@auth/prisma-adapter` — Connects Auth.js to Prisma ORM
- `zod` — Input validation (already a peer dep, may need explicit install)

---

## Auth Core Configuration

### [NEW] auth.config.ts

Edge-safe auth config containing **only providers and callbacks** — no DB/Prisma imports.

```typescript
// Providers: GitHub OAuth + Credentials (email/password)
// Callbacks: authorized(), jwt(), session()
// Pages: custom sign-in/sign-up routes
// NO database adapter or Prisma imports
```

Key decisions:
- `authorized` callback in `callbacks` — controls route access in middleware proxy.ts
- `pages.signIn` → `/login` (custom page)
- Credentials provider defines `email` and `password` fields
- The `authorize` function is **lazy-imported** from `auth.ts` to avoid pulling Node.js deps into edge

### [NEW] auth.ts

Full Node.js auth config that merges `auth.config.ts` + adds Prisma adapter.

```typescript
// Imports: NextAuth, PrismaAdapter, prisma client, authConfig
// Exports: { auth, handlers, signIn, signOut }
// Config: adapter: PrismaAdapter(prisma), session: { strategy: "jwt" }
// Spreads ...authConfig for providers/callbacks
```

### [NEW] proxy.ts

Edge-compatible middleware as proxy.ts for route protection.

```typescript
// Imports: NextAuth from "next-auth" + authConfig (edge-safe)
// Exports: { auth as proxy }
// config.matcher: protects /dashboard/**, /api/** (except /api/auth/**)
```
```example 
import { auth } from "@/auth"
 
 export const proxy = auth((req) => {
 if (!req.auth && req.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## Environment & Config

### [NEW] .env.example

Template with all required environment variables:

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-with-npx-auth-secret"
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

---

## Verification

Run build verification to ensure no edge/Node.js runtime conflicts:

```bash
npm run build
```

This is critical because it will catch any edge-incompatible imports in `proxy.ts` or `auth.config.ts`.