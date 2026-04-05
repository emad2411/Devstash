# DevStash — Developer Knowledge Hub

> **One fast, searchable, AI-enhanced hub for all your development knowledge & resources.**

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Database Schema](#-database-schema)
5. [Implementation Roadmap](#-implementation-roadmap)
6. [UI/UX Design System](#-uiux-design-system)
7. [Monetization Strategy](#-monetization-strategy)
8. [API Routes](#-api-routes)
9. [Environment Variables](#-environment-variables)
10. [Useful Links](#-useful-links)

---

## 🎯 Project Overview

### Problem Statement

Developers currently scatter their essential resources across multiple platforms:

| Resource Type | Current Location |
|--------------|------------------|
| Code Snippets | VS Code, Notion, Gists |
| AI Prompts | Chat histories |
| Context Files | Buried in project folders |
| Useful Links | Browser bookmarks |
| Documentation | Random folders |
| Terminal Commands | `.txt` files, bash history |
| Project Templates | GitHub Gists |

**DevStash** eliminates context switching and knowledge loss by providing a unified, fast, searchable hub for all developer resources.

### Target Users

| Persona | Primary Need |
|---------|-------------|
| **Everyday Developer** | Fast access to snippets, prompts, commands |
| **AI-first Developer** | Prompt management, context storage, workflows |
| **Content Creator/Educator** | Code blocks, explanations, course notes |
| **Full-stack Builder** | Patterns, boilerplates, API examples |

---

## 🛠 Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | Full-stack React framework |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type safety |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **Neon** | Serverless PostgreSQL |
| **Prisma** | ORM (v7 latest) |
| **Redis** | Caching (optional) |
| **Cloudflare R2** | File storage |

### Authentication
| Technology | Method |
|------------|--------|
| **Next-Auth v5** | Email/password + GitHub OAuth |

### UI/Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS v4** | Utility-first styling |
| **ShadCN UI** | Component library |
| **Lucide React** | Icons |

### AI Integration
| Technology | Model |
|------------|-------|
| **OpenAI API** | `gpt-5-nano` |

---

## 📁 Project Structure

```
devstash/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group routes
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Main app group
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard home
│   │   ├── items/
│   │   │   ├── [type]/           # /items/snippets, /items/prompts
│   │   │   └── [id]/             # Individual item view
│   │   ├── collections/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── search/
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/
│   │   ├── items/
│   │   ├── collections/
│   │   ├── upload/
│   │   ├── ai/
│   │   └── export/
│   ├── layout.tsx
│   └── globals.css
├── components/                   # React components
│   ├── ui/                       # ShadCN components
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── navbar.tsx
│   │   └── drawer.tsx
│   ├── items/                    # Item-related components
│   │   ├── item-card.tsx
│   │   ├── item-drawer.tsx
│   │   ├── item-form.tsx
│   │   └── code-block.tsx
│   ├── collections/              # Collection components
│   │   ├── collection-card.tsx
│   │   └── collection-form.tsx
│   ├── search/                   # Search components
│   │   ├── search-bar.tsx
│   │   └── search-results.tsx
│   └── ai/                       # AI feature components
│       ├── ai-suggest-tags.tsx
│       └── ai-explain-code.tsx
├── lib/                          # Utilities & configs
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # Auth configuration
│   ├── utils.ts                  # Helper functions
│   ├── constants.ts              # App constants
│   └── validations.ts            # Zod schemas
├── hooks/                        # Custom React hooks
│   ├── use-items.ts
│   ├── use-collections.ts
│   └── use-search.ts
├── types/                        # TypeScript types
│   └── index.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
├── public/                       # Static assets
├── styles/                       # Global styles
├── scripts/                      # Utility scripts
└── docs/                         # Documentation
    └── project-overview.md       # This file
```

---

## 🗄 Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ITEM : creates
    USER ||--o{ COLLECTION : creates
    USER ||--o{ ITEMTYPE : creates
    ITEM ||--o{ ITEMCOLLECTION : belongs_to
    COLLECTION ||--o{ ITEMCOLLECTION : contains
    ITEM ||--o{ ITEMTAG : has
    TAG ||--o{ ITEMTAG : belongs_to
    ITEMTYPE ||--o{ ITEM : categorizes

    USER {
        string id PK
        string email
        string name
        string image
        boolean isPro
        string stripeCustomerId
        string stripeSubscriptionId
        datetime createdAt
        datetime updatedAt
    }

    ITEM {
        string id PK
        string title
        enum contentType
        text content
        string fileUrl
        string fileName
        int fileSize
        string url
        text description
        boolean isFavorite
        boolean isPinned
        string language
        datetime createdAt
        datetime updatedAt
        string userId FK
        string itemTypeId FK
    }

    ITEMTYPE {
        string id PK
        string name
        string icon
        string color
        boolean isSystem
        string userId FK
    }

    COLLECTION {
        string id PK
        string name
        text description
        boolean isFavorite
        string defaultTypeId FK
        datetime createdAt
        datetime updatedAt
        string userId FK
    }

    ITEMCOLLECTION {
        string itemId FK
        string collectionId FK
        datetime addedAt
    }

    TAG {
        string id PK
        string name
    }

    ITEMTAG {
        string itemId FK
        string tagId FK
    }
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Next-Auth Models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id                    String       @id @default(cuid())
  email                 String       @unique
  emailVerified         DateTime?
  name                  String?
  image                 String?
  accounts              Account[]
  sessions              Session[]

  // DevStash specific
  isPro                 Boolean      @default(false)
  stripeCustomerId      String?      @unique
  stripeSubscriptionId  String?      @unique

  items                 Item[]
  collections           Collection[]
  itemTypes             ItemType[]

  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// DevStash Models
enum ContentType {
  TEXT
  FILE
}

model Item {
  id            String           @id @default(cuid())
  title         String
  contentType   ContentType      @default(TEXT)
  content       String?          @db.Text

  // File fields
  fileUrl       String?
  fileName      String?
  fileSize      Int?

  // Link specific
  url           String?

  description   String?          @db.Text
  isFavorite    Boolean          @default(false)
  isPinned      Boolean          @default(false)
  language      String?          // For syntax highlighting

  // Relations
  userId        String
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  itemTypeId    String
  itemType      ItemType         @relation(fields: [itemTypeId], references: [id])

  collections   ItemCollection[]
  tags          ItemTag[]

  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@index([userId])
  @@index([itemTypeId])
  @@index([isFavorite])
  @@index([isPinned])
}

model ItemType {
  id          String    @id @default(cuid())
  name        String    // snippet, prompt, note, command, file, image, link
  icon        String    // Lucide icon name
  color       String    // Hex color code
  isSystem    Boolean   @default(false)

  userId      String?   // Null for system types
  user        User?     @relation(fields: [userId], references: [id], onDelete: Cascade)

  items       Item[]
  collections Collection[] @relation("DefaultType")

  @@unique([name, userId])
}

model Collection {
  id              String           @id @default(cuid())
  name            String
  description     String?          @db.Text
  isFavorite      Boolean          @default(false)

  defaultTypeId   String?
  defaultType     ItemType?        @relation("DefaultType", fields: [defaultTypeId], references: [id])

  userId          String
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  items           ItemCollection[]

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([userId])
  @@index([isFavorite])
}

model ItemCollection {
  itemId        String
  item          Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)

  collectionId  String
  collection    Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  addedAt       DateTime   @default(now())

  @@id([itemId, collectionId])
  @@index([collectionId])
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  items ItemTag[]
}

model ItemTag {
  itemId String
  item   Item   @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tagId  String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Project setup (Next.js 16, TypeScript, Tailwind v4)
- [x] Database setup (Neon + Prisma)
- [x] Authentication (Next-Auth v5)
- [x] Basic layout (Sidebar + Main)
- [x] System ItemTypes seeding

### Phase 2: Core CRUD (Week 3-4)
- [ ] Item creation (text types: snippet, prompt, note, command, link)
- [ ] Item listing by type (`/items/[type]`)
- [ ] Item drawer component
- [ ] Collection CRUD
- [ ] Item-Collection relationships
- [ ] Favorites & Pinning

### Phase 3: Search & UX (Week 5-6)
- [ ] Global search implementation
- [ ] Markdown editor for text items
- [ ] Syntax highlighting
- [ ] Dark mode default
- [ ] Responsive sidebar (drawer on mobile)
- [ ] Toast notifications
- [ ] Loading skeletons

### Phase 4: File Handling (Week 7)
- [ ] Cloudflare R2 setup
- [ ] File upload API
- [ ] File/Image item types (Pro foundation)
- [ ] Import from file feature

### Phase 5: AI Features (Week 8)
- [ ] OpenAI integration
- [ ] Auto-tag suggestions
- [ ] Code explanation
- [ ] Prompt optimizer
- [ ] AI summaries

### Phase 6: Pro Features & Polish (Week 9-10)
- [ ] Stripe integration
- [ ] Pro limits enforcement
- [ ] Export data (JSON/ZIP)
- [ ] Recently used tracking
- [ ] Performance optimization
- [ ] Final testing & bug fixes

---

## 🎨 UI/UX Design System

### Color Palette

#### Type Colors (Core Identity)
| Type | Color | Hex | Usage |
|------|-------|-----|-------|
| **Snippet** | 🔵 Blue | `#3b82f6` | Code snippets |
| **Prompt** | 🟣 Purple | `#8b5cf6` | AI prompts |
| **Command** | 🟠 Orange | `#f97316` | Terminal commands |
| **Note** | 🟡 Yellow | `#fde047` | General notes |
| **File** | ⚪ Gray | `#6b7280` | File attachments |
| **Image** | 🩷 Pink | `#ec4899` | Image uploads |
| **Link** | 🟢 Emerald | `#10b981` | URL bookmarks |

#### UI Colors (Dark Mode Default)
```css
/* Background */
--bg-primary: #0f0f0f;
--bg-secondary: #1a1a1a;
--bg-tertiary: #262626;

/* Text */
--text-primary: #fafafa;
--text-secondary: #a3a3a3;
--text-muted: #737373;

/* Border */
--border-primary: #262626;
--border-secondary: #404040;

/* Accent */
--accent-primary: #3b82f6;
--accent-hover: #2563eb;
```

### Icon Mapping

| Type | Lucide Icon | Icon Name |
|------|-------------|-----------|
| Snippet | `<Code />` | `Code` |
| Prompt | `<Sparkles />` | `Sparkles` |
| Command | `<Terminal />` | `Terminal` |
| Note | `<StickyNote />` | `StickyNote` |
| File | `<File />` | `File` |
| Image | `<Image />` | `Image` |
| Link | `<Link />` | `Link` |
| Collection | `<Folder />` | `Folder` |
| Favorite | `<Star />` | `Star` |
| Pinned | `<Pin />` | `Pin` |
| Search | `<Search />` | `Search` |
| Settings | `<Settings />` | `Settings` |
| Add | `<Plus />` | `Plus` |
| Edit | `<Pencil />` | `Pencil` |
| Delete | `<Trash2 />` | `Trash2` |
| Close | `<X />` | `X` |
| Menu | `<Menu />` | `Menu` |
| Chevron | `<ChevronRight />` | `ChevronRight` |
| External Link | `<ExternalLink />` | `ExternalLink` |
| Copy | `<Copy />` | `Copy` |
| Download | `<Download />` | `Download` |
| Upload | `<Upload />` | `Upload` |
| AI | `<Bot />` | `Bot` |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter/System | 2rem (32px) | 700 |
| H2 | Inter/System | 1.5rem (24px) | 600 |
| H3 | Inter/System | 1.25rem (20px) | 600 |
| Body | Inter/System | 1rem (16px) | 400 |
| Small | Inter/System | 0.875rem (14px) | 400 |
| Code | JetBrains Mono/Fira Code | 0.875rem | 400 |

### Layout Specifications

```
Sidebar: 280px width (collapsible to 80px)
Main Content: Flexible
Max Content Width: 1400px
Card Grid: Responsive (1-4 columns)
Card Border Radius: 12px
Drawer Width: 600px (desktop), 100% (mobile)
Spacing Scale: 4px base (4, 8, 12, 16, 24, 32, 48, 64)
```

### Micro-interactions

- **Transitions**: `150ms ease-in-out` for all interactive elements
- **Hover States**: 
  - Cards: `transform: translateY(-2px)`, shadow increase
  - Buttons: Background color darken/lighten
- **Focus States**: Ring outline with primary color
- **Toast Notifications**: Slide in from bottom-right, auto-dismiss 3s
- **Loading**: Skeleton screens with pulse animation

---

## 💰 Monetization Strategy

### Free Tier
| Feature | Limit |
|---------|-------|
| Items | 50 total |
| Collections | 3 |
| Types | System types only (no file/image) |
| Search | Basic |
| File Upload | ❌ |
| AI Features | ❌ |

### Pro Tier ($8/month or $72/year — 25% savings)
| Feature | Limit |
|---------|-------|
| Items | Unlimited |
| Collections | Unlimited |
| Types | All + Custom types (future) |
| File Upload | ✅ Up to 10MB per file |
| Image Upload | ✅ |
| AI Auto-tagging | ✅ |
| AI Code Explanation | ✅ |
| AI Prompt Optimizer | ✅ |
| Data Export | JSON/ZIP |
| Priority Support | ✅ |

### Development Mode
> **Note**: During development, all users have Pro access for testing purposes.

---

## 🔌 API Routes

### Authentication
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | ALL | Next-Auth handlers |

### Items
| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/items` | GET | List user's items | ✅ |
| `/api/items` | POST | Create new item | ✅ |
| `/api/items/[id]` | GET | Get single item | ✅ |
| `/api/items/[id]` | PATCH | Update item | ✅ |
| `/api/items/[id]` | DELETE | Delete item | ✅ |
| `/api/items/[id]/favorite` | POST | Toggle favorite | ✅ |
| `/api/items/[id]/pin` | POST | Toggle pin | ✅ |

### Collections
| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/collections` | GET | List user's collections | ✅ |
| `/api/collections` | POST | Create collection | ✅ |
| `/api/collections/[id]` | GET | Get collection with items | ✅ |
| `/api/collections/[id]` | PATCH | Update collection | ✅ |
| `/api/collections/[id]` | DELETE | Delete collection | ✅ |
| `/api/collections/[id]/items` | POST | Add item to collection | ✅ |
| `/api/collections/[id]/items/[itemId]` | DELETE | Remove item from collection | ✅ |

### Upload
| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/upload` | POST | Upload file to R2 | ✅ Pro |
| `/api/upload/url` | POST | Get presigned URL | ✅ Pro |

### AI (Pro)
| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/ai/suggest-tags` | POST | AI tag suggestions | ✅ Pro |
| `/api/ai/explain` | POST | Explain code | ✅ Pro |
| `/api/ai/optimize-prompt` | POST | Optimize prompt | ✅ Pro |
| `/api/ai/summarize` | POST | Summarize content | ✅ Pro |

### Export
| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/export` | GET | Export all data | ✅ Pro |

### Search
| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/search` | GET | Global search | ✅ |

---

## 🔐 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Next-Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Cloudflare R2 (File Storage)
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="devstash-files"
R2_PUBLIC_URL="https://pub-your-id.r2.dev"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Stripe (Payments)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."

# Redis (Optional)
REDIS_URL="redis://localhost:6379"
```

---

## 📚 Useful Links

### Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next-Auth v5 Docs](https://authjs.dev)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [ShadCN UI](https://ui.shadcn.com)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)

### Tools & Resources
- [Lucide Icons](https://lucide.dev)
- [OpenAI API](https://platform.openai.com)
- [Stripe Docs](https://stripe.com/docs)
- [Neon Console](https://console.neon.tech)

### Inspiration
- [Linear](https://linear.app) — Clean UI/UX
- [Notion](https://notion.so) — Organization patterns
- [Raycast](https://raycast.com) — Developer-focused design
- [Vercel](https://vercel.com) — Dark mode aesthetics

---

## 📝 Notes & Best Practices

### Database Migrations
> ⚠️ **CRITICAL**: Never use `db push` in production. Always create migrations:
> ```bash
> npx prisma migrate dev --name your_migration_name
> ```

### Code Style
- Use TypeScript strict mode
- Prefer server components unless interactivity needed
- Use `useActionState` for form handling
- Implement optimistic updates for better UX

### Performance
- Use Prisma's `select` to limit query fields
- Implement pagination for item lists (20 items/page)
- Use `next/image` for optimized images
- Cache collection lists in Redis

### Security
- Validate all inputs with Zod
- Use Row Level Security (RLS) patterns in queries
- Sanitize user-generated content
- Implement rate limiting on AI routes

---

*Last Updated: March 2026*
*Version: 1.0*
