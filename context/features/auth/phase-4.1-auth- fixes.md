# Refactor Auth Pages to Server Components

Both [login/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/%28auth%29/login/page.tsx) and [register/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/%28auth%29/register/page.tsx) are marked `'use client'` at the page level, violating the project's coding standards:

> **coding-standards.md**: "Server components by default. Only use `'use client'` when needed (interactivity, hooks, browser APIs)."
> **project-overview.md**: "Prefer server components unless interactivity needed."

## Root Cause Analysis

Two things force `'use client'` on the pages:

| Reason | Code | Impact |
|--------|------|--------|
| `useActionState` hook | `const [state, formAction, isPending] = useActionState(...)` | Requires React client hooks |
| `signIn` from `next-auth/react` | `onClick={() => signIn("github", ...)}` | Client-side import + event handler |

## Proposed Changes

The fix follows the project's separation-of-concerns pattern: **page files are server components** that compose **client sub-components**.

---

### Auth Components (NEW)

#### [NEW] [login-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/login-form.tsx)

Extract the entire login card (form + OAuth button + link) into a `'use client'` component. Contains `useActionState(loginAction, null)` and the `signIn("github")` call.

#### [NEW] [register-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/register-form.tsx)

Extract the entire register card (form + OAuth button + link) into a `'use client'` component. Contains `useActionState(registerAction, null)` and the `signIn("github")` call.

---

### Auth Pages (MODIFY)

#### [MODIFY] [page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/(auth)/login/page.tsx)

- Remove `'use client'` directive
- Remove all component logic
- Import and render `<LoginForm />` as a server component page

```tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return <LoginForm />;
}
```

#### [MODIFY] [page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/(auth)/register/page.tsx)

- Remove `'use client'` directive
- Remove all component logic
- Import and render `<RegisterForm />` as a server component page

```tsx
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return <RegisterForm />;
}
```

## No Changes Required

- [actions/auth.ts](file:///c:/Users/ramam/Desktop/devstash/actions/auth.ts) — Already uses `"use server"`, no changes needed.
- [app/(auth)/layout.tsx](file:///c:/Users/ramam/Desktop/devstash/app/%28auth%29/layout.tsx) — Already a server component, no changes needed.

## Verification Plan

### Automated (Build)
```bash
npm run build
```
The build must pass with no errors. This confirms the pages are valid server components and the client boundary is correctly placed on the form components.

### Manual Verification
1. Run `npm run dev`
2. Navigate to `/login` — form should render identically, submit should work, GitHub OAuth button should work
3. Navigate to `/register` — form should render identically, submit should work, GitHub OAuth button should work
4. Verify validation errors still display inline (submit empty form)
