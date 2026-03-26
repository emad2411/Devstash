# Phase 3: Auth UI & Dashboard Protection

## Goal

Create the login/register pages and protect the dashboard routes.

---

## Auth UI Pages

### [NEW] app/(auth)/layout.tsx

Minimal centered layout for auth pages (no sidebar/navbar).

### [NEW] app/(auth)/login/page.tsx

Login page with:
- Email/password form using `useActionState`
- GitHub OAuth button
- Link to register page

### [NEW] app/(auth)/register/page.tsx

Register page with:
- Name, email, password, confirm password form
- GitHub OAuth button
- Link to login page

---

## Dashboard Route Protection

### [MODIFY] app/dashboard/layout.tsx

Add server-side session check. Redirect to `/login` if not authenticated.

---

## Manual Verification (Browser)

> These should be verified after starting the dev server with `npm run dev`:

1. **Unauthenticated redirect**: Navigate to `http://localhost:3000/dashboard` → should redirect to `/login`
2. **Login page renders**: Navigate to `/login` → should see email/password form + GitHub button
3. **Register page renders**: Navigate to `/register` → should see registration form + GitHub button
4. **Registration flow**: Fill in name/email/password on `/register` → submit → should create user and redirect to `/dashboard`
5. **Login flow**: Sign out, then log in with the registered email/password → should redirect to `/dashboard`
6. **GitHub OAuth**: Click "Continue with GitHub" → should redirect to GitHub, authorize, and return to `/dashboard`
7. **Session persistence**: After login, refresh the page → should remain authenticated
8. **Sign out**: Click sign out → should redirect to `/login`
9. **API protection**: Try `GET /api/items` without auth → should return 401

> [!NOTE]
> GitHub OAuth requires setting up a GitHub OAuth App at https://github.com/settings/developers. Set the callback URL to `http://localhost:3000/api/auth/callback/github`.