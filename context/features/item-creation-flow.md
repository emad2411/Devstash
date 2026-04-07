# Build Item Creation Flow

This plan covers Phase 2, Step 1: implementing item creation for text-based types (snippets, prompts, notes, commands, links).

## User Review Required

> [!NOTE]
> Please review the proposed approach for handling the form UI and the Server Action. It strictly follows the `useActionState` and Zod pattern established in `actions/auth.ts`.

## Proposed Changes

### Configuration & Validation

#### [MODIFY] [lib/validations.ts](file:///c:/Users/ramam/Desktop/devstash/lib/validations.ts)
- Add a new `createItemSchema` using Zod.
- Must validate `title` (required), `itemTypeId` (required), `content` (optional string for text types), `url` (optional string for links), `description` (optional), and `tags` (optional, array or comma-separated string).
- Will accommodate specific conditionally required fields based on the selected type (e.g. `url` required if it's a link).

---

### Backend Logic

#### [NEW] [actions/items.ts](file:///c:/Users/ramam/Desktop/devstash/actions/items.ts)
- Create `createItemAction(prevState, formData)` server action.
- Retrieves the current authenticated session.
- Validates submitted `formData` using `createItemSchema`.
- Interacts with Prisma to construct the `Item` record, connecting to the defined `ItemType`, the current User, and optionally upserting and connecting any associated `Tags`.
- Uses `revalidatePath` to trigger a UI refresh of the dashboard and item lists upon success.

---

### UI Components

#### [NEW] [components/items/item-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/items/item-form.tsx)
- The main client-side form component using `react-hook-form` + `@hookform/resolvers/zod`.
- Utilizes existing `shadcn/ui` components (`Input`, `Label`, `Textarea`, `Button`).
- Automatically adjusts its displayed fields depending on the selected `ItemType` (e.g., showing a `Language` input for Snippets or a `URL` input for Links).
- Employs React 19's `useActionState` (wrapping the `createItemAction`) to gracefully handle loading and error states without excessive client-side state management.

#### [MODIFY] [components/layout/sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx)
- Embed a "New Item" trigger button visually into the dashboard layout.

## Open Questions

> [!TIP]
> **Form Placement:** Step 3 of Phase 2 is building an "Item Drawer." Should we implement the `ItemForm` directly into a new Drawer/Modal right now so the user can trigger it from anywhere, or would you prefer a dedicated page (`/dashboard/items/new`) for this Step 1?

## Verification Plan

### Automated Tests
- TypeScript compliance (`npm run check`).
- Linter verification (`npm run lint`).

### Manual Verification
- Access the DevStash application in a browser.
- Open the Create Item flow.
- Ensure validation kicks in (e.g. leaving title blank).
- Submit a Snippet, a Prompt, and a Link successfully.
- Verify that saving appropriately assigns tags and that the new item appears on the Dashboard.
