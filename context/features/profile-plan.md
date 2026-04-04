# Profile Page — Implementation Plan

## Overview

Build a protected `/dashboard/profile` page displaying user info, usage stats, account actions (change password for email users, delete account), following all existing codebase patterns.

---

## Route & File Structure

```
app/dashboard/profile/
  page.tsx                          # Server component — data fetching

components/profile/
  profile-header.tsx                # Client — avatar, name, email, plan badge, join date
  profile-stats.tsx                 # Client — usage stat cards (total items, collections, type breakdown)
  change-password-form.tsx          # Client — change password form (email users only)
  delete-account-dialog.tsx         # Client — confirmation dialog + server action call

actions/
  profile.ts                        # Server actions: updateProfile, changePassword, deleteAccount

lib/
  queries.ts                        # Add: getProfileData(), getProfileStats()
  validations.ts                    # Add: changePasswordSchema, deleteAccountSchema
```

---

## Step 1: Data Layer — Queries & Validations

### 1a. Add Zod validations to `lib/validations.ts`

```typescript
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

export const deleteAccountSchema = z.object({
  confirmEmail: z.string().email(),
})
```

### 1b. Add profile queries to `lib/queries.ts`

```typescript
/** Fetch user profile data including auth provider info */
export async function getProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      isPro: true,
      createdAt: true,
      accounts: {
        select: { provider: true },
      },
    },
  })

  if (!user) return null

  return {
    ...user,
    hasPasswordAccount: user.accounts.some((a) => a.provider === "credentials"),
    isGithubUser: user.accounts.some((a) => a.provider === "github"),
  }
}

/** Fetch profile stats: total items, collections, and breakdown by item type */
export async function getProfileStats(userId: string) {
  const [totalItems, totalCollections, itemsByType] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: {
        OR: [{ isSystem: true }, { userId }],
        items: { some: { userId } },
      },
      select: {
        name: true,
        icon: true,
        color: true,
        _count: { select: { items: { where: { userId } } } },
      },
      orderBy: { name: "asc" },
    }),
  ])

  return {
    totalItems,
    totalCollections,
    breakdown: itemsByType.map((t) => ({
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    })),
  }
}
```

---

## Step 2: Server Actions — `actions/profile.ts`

### 2a. Change Password

```typescript
export async function changePasswordAction(prevState: unknown, formData: FormData) {
  const sessionUser = await requireAuth()

  const validated = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validated.success) {
    return { error: "Invalid form data", errors: validated.error.flatten().fieldErrors }
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { password: true },
  })

  // Security: user must have a password (not OAuth-only)
  if (!user?.password) {
    return { error: "No password set for this account" }
  }

  const isValid = await bcrypt.compare(validated.data.currentPassword, user.password)
  if (!isValid) {
    return { error: "Current password is incorrect", field: "currentPassword" }
  }

  const hashedPassword = await bcrypt.hash(validated.data.newPassword, 10)
  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { password: hashedPassword },
  })

  return { success: true, message: "Password updated successfully" }
}
```

**Security measures:**
- Requires authenticated session via `requireAuth()`
- Verifies current password before allowing change
- Rejects OAuth-only users (no password field)
- Prevents reuse of current password
- New password hashed with bcrypt (cost factor 10)

### 2b. Delete Account

```typescript
export async function deleteAccountAction(prevState: unknown, formData: FormData) {
  const sessionUser = await requireAuth()

  const validated = deleteAccountSchema.safeParse({
    confirmEmail: formData.get("confirmEmail"),
  })

  if (!validated.success) {
    return { error: "Please enter a valid email" }
  }

  // Security: must match the authenticated user's email exactly
  if (validated.data.confirmEmail !== sessionUser.email) {
    return { error: "Email does not match your account email" }
  }

  // Delete user and all related data (cascading via schema)
  await prisma.user.delete({ where: { id: sessionUser.id } })

  // Sign out and redirect
  await signOut({ redirect: false })
  redirect("/")
}
```

**Security measures:**
- Email confirmation required (type the actual email to confirm)
- Compares against the session email, not a form-submitted one
- Uses Prisma cascading deletes (items, collections, tags, sessions all cleaned up)
- Signs out the user after deletion
- Cannot be called by unauthenticated users

---

## Step 3: Profile Page — `app/dashboard/profile/page.tsx`

Server component following the dashboard data-fetching pattern:

```typescript
import { connection } from "next/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { getProfileData, getProfileStats, getItemTypes, getCollections } from "@/lib/queries"
import { SidebarCollection } from "@/types/layout"

export default async function ProfilePage() {
  await connection()
  const sessionUser = await requireAuth()

  // Parallel data fetching
  const [user, stats, itemTypes, collections] = await Promise.all([
    getProfileData(sessionUser.id),
    getProfileStats(sessionUser.id),
    getItemTypes(sessionUser.id),
    getCollections(sessionUser.id),
  ])

  if (!user) throw new Error("User not found")

  const sidebarCollections: SidebarCollection[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.itemCount,
    color: c.mostCommonColor,
  }))

  return (
    <DashboardLayout collections={sidebarCollections} navItems={itemTypes} user={user}>
      <div className="mx-auto max-w-3xl space-y-8">
        <ProfileHeader user={user} />
        <ProfileStats stats={stats} />
        {user.hasPasswordAccount && <ChangePasswordForm />}
        <DeleteAccountDialog user={user} />
      </div>
    </DashboardLayout>
  )
}
```

**Key decisions:**
- Nested under `/dashboard/profile` (inherits dashboard layout protection)
- `requireAuth()` at page level for defense in depth
- All data fetched in parallel with `Promise.all()`
- Passes minimal props to client components (no Prisma objects leak to client)
- `max-w-3xl` — profile is a focused settings page, not a wide dashboard

---

## Step 4: Client Components

### 4a. `profile-header.tsx`

Displays user identity section at the top of the page.

**Props interface:**
```typescript
interface ProfileHeaderProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    isPro: boolean
    createdAt: Date
    isGithubUser: boolean
    emailVerified: Date | null
  }
}
```

**UI elements:**
- Large avatar (64px) with GitHub image or initials fallback (reuse `getInitials` from `lib/utils.ts`)
- User name (or "Developer" fallback)
- Email address
- Plan badge ("Free Plan" / "Pro Plan") — reuses sidebar pattern
- Account creation date formatted with `toLocaleDateString()`
- OAuth provider badge ("Connected with GitHub") if applicable
- Email verification status indicator

### 4b. `profile-stats.tsx`

Displays usage statistics in a grid.

**Props interface:**
```typescript
interface ProfileStatsProps {
  stats: {
    totalItems: number
    totalCollections: number
    breakdown: Array<{
      name: string
      icon: string
      color: string
      count: number
    }>
  }
}
```

**UI elements:**
- Two summary cards at top: "Total Items" and "Total Collections"
- Below: a grid of type-specific stat cards showing icon + name + count for each item type that has items
- Uses `renderIcon()` from `lib/icon-map.tsx` for type icons
- Uses `shadcn/ui Card` component for stat containers
- Sorted by count (most items first)

### 4c. `change-password-form.tsx`

Client component with `'use client'` directive. Uses `useActionState` for form handling.

**UI elements:**
- Section heading: "Change Password"
- Three fields: Current Password, New Password, Confirm Password
- All inputs use `type="password"`
- Submit button with loading state
- Error messages displayed below relevant fields
- Success toast/message on completion
- Uses existing `Input`, `Label`, `Button` shadcn components

**Security considerations:**
- Form only rendered if `user.hasPasswordAccount` is true
- Current password verified server-side (never stored or logged)
- Clear field after successful change

### 4d. `delete-account-dialog.tsx`

Client component with `'use client'` directive.

**UI elements:**
- Section heading: "Danger Zone" with destructive styling (red accent)
- "Delete Account" button opens a confirmation dialog
- Dialog requires user to type their email address to confirm
- Dialog has two buttons: "Cancel" and "Permanently Delete Account" (destructive/red)
- Loading state on delete button during submission

**Security considerations:**
- Must type exact email to confirm — prevents accidental deletion
- Server action re-validates email against session
- All data deleted via Prisma cascade
- User signed out after deletion

---

## Step 5: Sidebar Navigation Update

Update the sidebar "Profile" dropdown menu item to link to the actual route:

**In `components/layout/sidebar.tsx`:**

Change the Profile `DropdownMenuItem` from a plain item to a link:

```tsx
import Link from "next/link"

<DropdownMenuItem className="cursor-pointer" asChild>
  <Link href="/dashboard/profile">
    <User className="mr-2 h-4 w-4" />
    Profile
  </Link>
</DropdownMenuItem>
```

This applies to both the expanded and collapsed sidebar states (two occurrences in the file).

---

## Step 6: Navbar Breadcrumbs (Optional Enhancement)

Add a subtle breadcrumb or page title in the navbar or content area so users know they're on the Profile page. This can be handled in the profile page itself as a header element — no navbar changes needed since the page content is self-explanatory.

---

## Security Checklist

| Concern | Mitigation |
|---------|-----------|
| **Route protection** | Page is under `/dashboard/` — protected by NextAuth `authorized` callback in `auth.config.ts` |
| **Authentication required** | `requireAuth()` called at page level and in every server action |
| **Password change auth** | Current password verified with `bcrypt.compare` before allowing update |
| **OAuth user protection** | Change password form only shown when `hasPasswordAccount` is true; server action also checks |
| **Account deletion confirmation** | Must type exact email; server re-validates against session email |
| **Cascade cleanup** | Prisma `onDelete: Cascade` on all relations ensures no orphan data |
| **Session invalidation** | `signOut()` called after account deletion |
| **Input validation** | All inputs validated with Zod schemas server-side |
| **No data leakage** | Server components pass only selected fields to client components |
| **Password security** | New passwords hashed with bcrypt (cost 10), min 8 chars, max 128 chars |

---

## Implementation Order

1. **Validations** — Add Zod schemas to `lib/validations.ts`
2. **Queries** — Add `getProfileData()` and `getProfileStats()` to `lib/queries.ts`
3. **Server Actions** — Create `actions/profile.ts` with all three actions
4. **Components** — Build client components: `ProfileHeader`, `ProfileStats`, `ChangePasswordForm`, `DeleteAccountDialog`
5. **Page** — Create `app/dashboard/profile/page.tsx`
6. **Sidebar link** — Update Profile dropdown item in `sidebar.tsx` to use `Link`
7. **Test** — Verify in browser, run `npm run build`
8. **Commit & merge**

---

## Notes

- Avatar logic: Reuse existing `getInitials()` from `lib/utils.ts` and `Avatar`/`AvatarImage`/`AvatarFallback` from shadcn/ui
- Date formatting: Use `toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })` — no external date library needed
- Toast for success messages: Use `sonner` or a simple state-based message since no toast library is currently installed — check if one exists first
- No new shadcn components needed — all required components (`Avatar`, `Button`, `Card`, `Input`, `Label`, `Separator`, `DropdownMenu`) are already installed
- The Dialog component may need to be installed via `npx shadcn@latest add dialog` if not already present
