# Phase 2: Auth Utilities & Server Actions

## Goal

Implement server-side utilities for session management and create server actions for authentication flows.

---

## API Route Handler

### [NEW] app/api/auth/[...nextauth]/route.ts

Next.js route handler for Auth.js.

```typescript
// Re-exports { GET, POST } from handlers in auth.ts
```

---

## Auth Utilities

### [NEW] lib/auth-utils.ts

Server-side helper to get the current session in server components/actions.

```typescript
// getCurrentUser() — calls auth(), returns session.user or null
// requireAuth() — calls auth(), throws/redirects if not authenticated
```

### [NEW] lib/validations.ts

Zod schemas for auth form validation (shared between client and server).

```typescript
// signInSchema: z.object({ email: z.string().email(), password: z.string().min(8) })
// signUpSchema: extends signInSchema + name field + password confirmation
```
> [!NOTE]
> double check the zod schemas format using the following page: https://zod.dev/api

---

## Server Actions

### [NEW] actions/auth.ts

Server Actions for login, register, and logout.

```typescript
// loginAction(formData) — validates with Zod, calls signIn("credentials", ...)
// registerAction(formData) — validates, hashes password with bcryptjs, creates user via Prisma, then signs in
// logoutAction() — calls signOut()
```

---

## Verification

Run lint check:

```bash
npm run lint
```