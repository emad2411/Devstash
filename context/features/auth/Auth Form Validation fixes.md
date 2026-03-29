# Auth Form Validation & Email Token Verification

Add robust client-side validation using **Zod + React Hook Form + shadcn Field** to all auth forms, and add server-side Zod validation of the email verification token from the URL.

---

## User Review Required

> [!IMPORTANT]
> **Architecture Shift**: The login and register forms currently use `useActionState` with native `<form action={...}>`. This plan replaces that with `react-hook-form` + `Controller` for client-side validation, then manually calls server actions on submit. The server actions themselves remain unchanged — Zod validation still runs server-side as a second line of defense.

> [!WARNING]
> **New Dependencies**: This requires installing `react-hook-form` and `@hookform/resolvers`, plus adding `field` and `input-group` shadcn UI components.

---

## Proposed Changes

### 1. Dependencies & UI Components

#### Install npm packages

```bash
npm install react-hook-form @hookform/resolvers
```

#### Add shadcn UI components

```bash
npx shadcn@latest add field input-group
```

This will generate:
- `components/ui/field.tsx` — `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`
- `components/ui/input-group.tsx` — `InputGroup`, `InputGroupAddon`, `InputGroupText`, `InputGroupTextarea`

---

### 2. Validation Schemas

#### [MODIFY] [validations.ts](file:///c:/Users/ramam/Desktop/devstash/lib/validations.ts)

Add new schemas for:
- **`resendVerificationSchema`** — validates the email field on the resend verification form
- **`verifyEmailTokenSchema`** — validates the `token` query parameter from the URL (hex string, exact 96 chars = 48 bytes hex-encoded)

Keep existing `signInSchema` and `signUpSchema` unchanged — they already have good constraints. Add a `passwordSchema` base to DRY-up the password rules between sign-in and sign-up.

```ts
// New additions
export const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const verifyEmailTokenSchema = z.object({
  token: z
    .string()
    .length(96, "Invalid verification token")
    .regex(/^[a-f0-9]+$/, "Invalid verification token format"),
})

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type VerifyEmailTokenInput = z.infer<typeof verifyEmailTokenSchema>
```

---

### 3. Form Component Refactors

All three form components below follow the same pattern from the reference example:

1. `useForm` with `zodResolver(schema)` for client-side validation
2. `Controller` wrapping each field with `Field`, `FieldLabel`, `Input`, `FieldError`
3. `onSubmit` handler calls the existing server action (via a manual invocation, not `useActionState`)
4. Server error state handled separately (e.g., "Invalid email or password", "Account already exists")

---

#### [MODIFY] [login-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/login-form.tsx)

**Current**: Uses `useActionState(loginAction)` + native `<form action>` + manual `{state?.errors?.email && ...}` error display.

**New**:
- Import `useForm`, `Controller`, `zodResolver` from `react-hook-form` / `@hookform/resolvers/zod`
- Import `Field`, `FieldLabel`, `FieldError`, `FieldGroup` from `@/components/ui/field`
- Create `useForm<SignInInput>({ resolver: zodResolver(signInSchema) })`
- Wrap email and password in `Controller` → `Field` → `FieldLabel` + `Input` + `FieldError`
- On `form.handleSubmit(onSubmit)`:
  - Build `FormData` from validated values
  - Call `loginAction(null, formData)` directly
  - Handle server response (set `serverError` state, handle `EMAIL_NOT_VERIFIED` code)
- Remove `useActionState` and `formRef`
- Keep GitHub OAuth button and "Don't have an account?" link unchanged

**Validation behavior**:
- Email: validated as valid email format on blur/change
- Password: validated as min 8 chars on blur/change
- Field errors appear inline below each input via `FieldError`
- Server errors (invalid credentials, unverified email) shown above the submit button

---

#### [MODIFY] [register-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/register-form.tsx)

**Current**: Uses `useActionState(registerAction)` + native `<form action>` + `useEffect` redirect.

**New**:
- Same pattern as login: `useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) })`
- Four `Controller` fields: name, email, password, confirmPassword
- On `form.handleSubmit(onSubmit)`:
  - Build `FormData` from validated values
  - Call `registerAction(null, formData)` directly
  - On success (`state.success && state.email`), redirect to `/verify-email?email=...`
  - On error, set `serverError` state
- Remove `useActionState`

**Validation behavior**:
- Name: min 1, max 50 chars
- Email: valid email format
- Password: min 8, max 128 chars
- Confirm Password: must match password (Zod `.refine()` already handles this)
- All errors shown inline via `FieldError`

---

#### [MODIFY] [resend-verification-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/resend-verification-form.tsx)

**Current**: Uses `useActionState(resendVerificationAction)` + manual state for email + countdown.

**New**:
- `useForm<ResendVerificationInput>({ resolver: zodResolver(resendVerificationSchema) })`
- Single `Controller` field for email (only shown when `!urlEmail`)
- When `urlEmail` is present, set form default value and skip rendering the field
- On `form.handleSubmit(onSubmit)`:
  - Build `FormData`, call `resendVerificationAction(null, formData)`
  - Handle success (start countdown) and error states
- Remove `useActionState`

---

### 4. Email Verification Token Validation

#### [MODIFY] [verify-email page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/(auth)/verify-email/page.tsx)

**Current**: Passes `params.token` directly to `VerifyEmailHandler` without any validation.

**New**:
- Import `verifyEmailTokenSchema` from `@/lib/validations`
- Parse `params.token` through `verifyEmailTokenSchema.safeParse()`
- If validation fails → render an error card instead of `VerifyEmailHandler`
- If validation passes → pass the validated token to `VerifyEmailHandler`
- Remove `console.log` debug statements

This is **server-side** validation at the page level, so no RHF needed — just Zod.

---

#### [MODIFY] [verify-email-handler.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/verify-email-handler.tsx)

- Remove `console.log` debug statements (security: don't log tokens client-side)
- Token is already validated by the parent page, so the handler receives a known-good token
- No form validation needed here (it's not a form — it's an effect-based API call)

---

#### [MODIFY] [verify-email route.ts](file:///c:/Users/ramam/Desktop/devstash/app/api/verify-email/route.ts)

**Current**: Only checks `!token || typeof token !== "string"`.

**New**:
- Import `verifyEmailTokenSchema`
- Parse `body` through `verifyEmailTokenSchema.safeParse()`
- Return 400 with specific error if validation fails
- Remove `console.log` debug statements

---

### 5. Auth Server Actions (No Changes)

#### [NO CHANGE] [auth.ts](file:///c:/Users/ramam/Desktop/devstash/actions/auth.ts)

The server actions already perform Zod validation as a second line of defense. The `loginAction` and `registerAction` parse `FormData` through `signInSchema`/`signUpSchema`. The function signatures remain compatible — forms will call them with `(null, formData)` instead of via `useActionState`.

> [!NOTE]
> We still keep server-side Zod validation in the actions as defense-in-depth. Client-side validation is for UX; server-side validation is for security.

---

## Summary of Files Changed

| Action | File | What Changes |
|--------|------|--------------|
| Install | `package.json` | Add `react-hook-form`, `@hookform/resolvers` |
| Add | `components/ui/field.tsx` | shadcn Field components (via CLI) |
| Add | `components/ui/input-group.tsx` | shadcn InputGroup components (via CLI) |
| Modify | `lib/validations.ts` | Add `resendVerificationSchema`, `verifyEmailTokenSchema` |
| Modify | `components/auth/login-form.tsx` | RHF + Controller + Field + zodResolver |
| Modify | `components/auth/register-form.tsx` | RHF + Controller + Field + zodResolver |
| Modify | `components/auth/resend-verification-form.tsx` | RHF + Controller + Field + zodResolver |
| Modify | `app/(auth)/verify-email/page.tsx` | Zod token validation before rendering |
| Modify | `components/auth/verify-email-handler.tsx` | Remove debug logs |
| Modify | `app/api/verify-email/route.ts` | Zod token validation on API input |

---

## Open Questions

> [!IMPORTANT]
> **Password strength indicator**: Should we add a visual password strength meter to the register form (e.g., bar showing weak/medium/strong)? This is not in the current spec but would enhance UX. Would add minimal complexity.

> [!IMPORTANT]
> **Zod v4 compatibility**: The project uses `zod@^4.3.6`. The `@hookform/resolvers` package officially supports Zod v3 via `@hookform/resolvers/zod`. For Zod v4, we should verify that the resolver works correctly — if not, we'll use `@hookform/resolvers/zod` with Zod v4's backward-compatible API or implement a thin custom resolver. I'll verify this during implementation.

---

## Verification Plan

### Automated Tests
- `npm run build` — Ensure no TypeScript errors after refactoring
- `npm run lint` — Ensure ESLint passes

### Manual Verification (Browser)
1. **Login form**: Submit empty → see inline errors. Type invalid email → see error. Type short password → see error. Fix all → submit → server validates → redirect to dashboard
2. **Register form**: Submit empty → see inline errors. Mismatched passwords → see error on confirmPassword. Valid data → redirect to verify-email page
3. **Resend verification form**: Submit empty email → see inline error. Valid email → success message + countdown
4. **Verify email page**: Navigate to `/verify-email?token=invalid` → see error card. Navigate with valid token → verification proceeds normally
5. **API endpoint**: POST `/api/verify-email` with `{ token: "bad" }` → 400 response with validation error
