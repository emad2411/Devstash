Now I have both documents. Let me create a comprehensive markdown prompt for implementing Prisma ORM v7 based on your **DevStash** project data models and coding standards.

---

```markdown
# Prisma ORM v7 Implementation Prompt

## Context
You are implementing the database layer for **DevStash** — a developer knowledge hub built with Next.js 16, TypeScript, and Neon PostgreSQL. Follow the data models from `@context/project-overview.md` and database standards from `@context/coding-standards.md`.

---

## Task
Set up Prisma ORM v7 with the complete schema, migrations, client configuration, and seeding for the DevStash application.

---

## Requirements

### 1. Prisma Schema Setup

Create `prisma/schema.prisma` with the following specifications:

**Database Configuration**
- Provider: `postgresql`
- Use `env("DATABASE_URL")` for connection string
- Generator: `prisma-client-js`

**Models to Implement**

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `User` | Application users + Next-Auth | `id`, `email`, `name`, `image`, `isPro`, `stripeCustomerId`, `stripeSubscriptionId` |
| `Account` | Next-Auth OAuth accounts | Standard Next-Auth fields |
| `Session` | Next-Auth sessions | Standard Next-Auth fields |
| `VerificationToken` | Next-Auth email verification | Standard Next-Auth fields |
| `Item` | Core content (snippets, prompts, etc.) | `title`, `contentType` (enum), `content`, `fileUrl`, `fileName`, `fileSize`, `url`, `description`, `isFavorite`, `isPinned`, `language` |
| `ItemType` | Content categories | `name`, `icon`, `color`, `isSystem`, `userId` (nullable) |
| `Collection` | User collections | `name`, `description`, `isFavorite`, `defaultTypeId` |
| `ItemCollection` | Many-to-many join | `itemId`, `collectionId`, `addedAt` |
| `Tag` | Content tags | `name` (unique) |
| `ItemTag` | Many-to-many join | `itemId`, `tagId` |

**Enum Definition**
```prisma
enum ContentType {
  TEXT
  FILE
}
```

**Critical Schema Rules**
- All IDs: `@id @default(cuid())`
- Timestamps: `createdAt` (`@default(now())`), `updatedAt` (`@updatedAt`)
- Soft delete: Use `onDelete: Cascade` for all relations
- Text fields: Use `@db.Text` for long content (`content`, `description`)
- Unique constraints: `@@unique([provider, providerAccountId])` on Account, `@@unique([name, userId])` on ItemType, `@@unique([identifier, token])` on VerificationToken, `@@unique([name])` on Tag
- Composite keys: `@@id([itemId, collectionId])` on ItemCollection, `@@id([itemId, tagId])` on ItemTag

**Required Indexes**
```prisma
@@index([userId])           // on Item, Collection
@@index([itemTypeId])        // on Item
@@index([isFavorite])         // on Item, Collection
@@index([isPinned])          // on Item
@@index([collectionId])      // on ItemCollection
```

---

### 2. Prisma Client Configuration

Create `src/lib/prisma.ts`:

**Requirements:**
- Instantiate PrismaClient singleton
- Handle hot reloading in development (`globalForPrisma` pattern)
- Export as `prisma` for use in Server Actions and API routes
- Enable query logging in development only

---

### 3. Environment Setup

Ensure `.env.local` contains:
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
```

---

### 4. Database Migrations

**CRITICAL:** Use migrations only — never `db push` in production.

Commands to run:
```bash
# Initial migration
npx prisma migrate dev --name init

# Check migration status before committing
npx prisma migrate status

# Generate client after schema changes
npx prisma generate
```

**Migration Checklist:**
- [ ] All tables created with proper constraints
- [ ] Foreign keys with `ON DELETE CASCADE`
- [ ] Indexes created for query performance
- [ ] Enum type `ContentType` registered

---

### 5. Seed Data

Create `prisma/seed.ts` for system ItemTypes:

**System Types to Insert:**
| Name | Icon | Color |
|------|------|-------|
| snippet | Code | #3b82f6 |
| prompt | Sparkles | #8b5cf6 |
| command | Terminal | #f97316 |
| note | StickyNote | #fde047 |
| file | File | #6b7280 |
| image | Image | #ec4899 |
| link | Link | #10b981 |

**Seed Requirements:**
- Set `isSystem: true` and `userId: null` for all system types
- Use `prisma.itemType.createMany()` with `skipDuplicates: true`
- Add to `package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }`

Run with: `npx prisma db seed`

---

### 6. TypeScript Integration

Generate types should automatically update `node_modules/.prisma/client`. Ensure:
- Import types from `@prisma/client` in Server Actions
- Use `Prisma.ItemCreateInput`, `Prisma.ItemUpdateInput` for action parameters

---

## Implementation Checklist

- [ ] `prisma/schema.prisma` created with all models
- [ ] `src/lib/prisma.ts` singleton client configured
- [ ] Initial migration created with `migrate dev --name init`
- [ ] `prisma/seed.ts` with 7 system ItemTypes
- [ ] `package.json` seed script configured
- [ ] Database seeded successfully
- [ ] Migration status verified (`prisma migrate status`)
- [ ] TypeScript types generated (`prisma generate`)

---

## Verification Steps

1. **Schema Validation:** `npx prisma validate`
2. **Database Connection:** `npx prisma db pull` (should match schema)
3. **Seed Execution:** `npx prisma db seed` (7 types created)
4. **Query Test:** Create a test item in a Server Action using `prisma.item.create()`

---

## Standards Compliance

From `@context/coding-standards.md`:
- ✅ Use Prisma ORM for all database operations
- ✅ Always use `prisma migrate dev` for schema changes (not `db push`)
- ✅ Run `prisma migrate status` before committing
- ✅ Production deployments must run `prisma migrate deploy` before app starts
- ✅ Server components fetch directly with Prisma
- ✅ Validate inputs with Zod (separate concern, not Prisma-specific)

---

## Example Usage Pattern

**Server Action with Prisma:**
```typescript
// src/actions/items.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createItemSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  itemTypeId: z.string(),
});

export async function createItem(input: z.infer<typeof createItemSchema>) {
  const validated = createItemSchema.parse(input);
  
  const item = await prisma.item.create({
    data: {
      title: validated.title,
      content: validated.content,
      itemTypeId: validated.itemTypeId,
      userId: "user_id_from_session", // Get from auth
    },
  });
  
  revalidatePath("/items");
  return { success: true, data: item };
}
```

---

## Output
Provide the complete file contents for:
1. `prisma/schema.prisma`
2. `src/lib/prisma.ts`
3. `prisma/seed.ts`
4. Required `package.json` modifications

Ensure all relationships, indexes, and constraints match the DevStash ERD exactly.
```

---

This prompt is structured to be **easy to follow** while being **comprehensive and informative**. It includes:

- **Clear task breakdown** with specific file requirements
- **Data model reference** from your project overview (all 10 models with exact fields)
- **Standards enforcement** from your coding standards (migrations over db push, singleton pattern)
- **Visual aids** (tables for models, colors for type mapping)
- **Verification steps** to ensure correctness
- **Real-world example** showing Server Action integration

The AI agent can use this to generate production-ready Prisma v7 setup for your DevStash project!