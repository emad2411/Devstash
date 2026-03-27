# Auth Phase 4: Integrating Current User into UI

This plan outlines the steps to replace the hardcoded demo user with the real authenticated user dynamically across the Dashboard and Sidebar components.

## User Review Required

- **User Model Requirements**: Are we okay querying `prisma.user` in [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx) to get the `isPro` status (since standard NextAuth session might only contain [id](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#146-286), `name`, `email`, `image`)? I will fetch the full `dbUser` to ensure all fields are available for the sidebar.

## Proposed Changes

### [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx)
#### [MODIFY] page.tsx
- Replace `await getDemoUser()` with NextAuth's `await requireAuth()`.
- Query `prisma.user.findUnique` to fetch the complete user record (including `isPro` status) using the session's user ID.
- Pass the fetched full `dbUser` as a `user` prop to the [DashboardLayout](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/layout.tsx#3-17) component.

### [components/layout/dashboard-layout.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/dashboard-layout.tsx)
#### [MODIFY] dashboard-layout.tsx
- Update [DashboardLayoutProps](file:///c:/Users/ramam/Desktop/devstash/components/layout/dashboard-layout.tsx#9-14) to accept a `user` object containing `{ name, email, image, isPro }`.
- Pass the `user` prop down to the [Sidebar](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#146-286) component.

### [components/layout/sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx)
#### [MODIFY] sidebar.tsx
- Update [SidebarProps](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#17-25) to accept the `user` object.
- **Avatar Integration**: Add `<AvatarImage>` to the `Avatar` component that displays `user.image`.
- **Avatar Fallback**: Dynamically compute initials from `user.name` or default to "Dev" instead of the hardcoded "JD".
- **User Details**: Replace the hardcoded "John Doe" with `user.name || user.email`.
- **Plan Status**: Conditionally render "Pro Plan" or "Free Plan" based on `user.isPro`.

### [lib/utils.ts](file:///c:/Users/ramam/Desktop/devstash/lib/utils.ts)
#### [MODIFY] utils.ts
- Add a helper function `getInitials(name?: string | null)` to reliably generate 2-letter fallback initials for the UI avatar.

### [context/current-feature.md](file:///c:/Users/ramam/Desktop/devstash/context/current-feature.md)
#### [MODIFY] current-feature.md
- Add "Phase 4: User Profile UI Integration" to the history and update the current goals.

## Verification Plan

### Automated Tests
_This project has no active test framework mentioned, skipping tests._

### Manual Verification
1. Run `npm run dev`.
2. Navigate to `http://localhost:3000` and ensure it properly redirects you to `/login` if unauthenticated.
3. Authenticate using an existing credential or GitHub OAuth.
4. Verify that the Dashboard's Welcome Header displays your real name.
5. Expand the Sidebar and ensure your actual avatar image is visible.
6. Check that your name and plan status match your account configuration.
7. Collapse the Sidebar and verify the tooltip displays your name and plan over the mini-avatar.
