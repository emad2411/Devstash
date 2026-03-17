# AGENTS.md - DevStash Developer Guide

> Guidelines for AI agents working in this repository.

---
## Context files 
read the following to get the full context of the project 
- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## 1. Commands

### Development
```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint on entire codebase
```

### Running Tests
> **Note**: This project currently has no test framework installed. If adding tests, use Vitest or Jest.

To run a single test file once a test framework is added:
```bash
npx vitest run src/specific-test-file.test.ts
# or
npm test -- src/specific-test-file.test.ts
```

---

## 2. Technology Stack

- **Framework**: Next.js 16.1.6 with App Router
- **React**: 19.2.3 (with React Compiler enabled)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI**: Shadcn UI latest 
- **Fonts**: Geist Sans & Mono via `next/font/google`

---

## 3. Project Structure

```
devstash/
├── app/                    # Next.js App Router (App Router pattern)
│   ├── (auth)/             # Auth group routes (login, register)
│   ├── (dashboard)/       # Main app group
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/                # ShadCN UI components
│   ├── layout/            # Sidebar, navbar, drawer
│   ├── items/             # Item-related components
│   ├── collections/      # Collection components
│   ├── search/            # Search components
│   └── ai/                # AI feature components
├── lib/                   # Utilities & configs
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Auth configuration
│   ├── utils.ts           # Helper functions
│   ├── constants.ts       # App constants
│   └── validations.ts     # Zod schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── prisma/                # Database schema & migrations
```

---

## 4. Code Style Guidelines

### TypeScript
- **Strict mode enabled** - All strict TypeScript rules apply
- Use explicit types for function parameters and return types when not obvious
- Prefer interfaces over types for object shapes
- Use `type` for unions, intersections, and primitives

### Imports
- Use path alias `@/*` for project-relative imports (e.g., `@/components/ui/button`)
- Group imports in this order:
  1. Built-in/Node (no prefix)
  2. External packages
  3. Alias imports (`@/`)
  4. Relative imports (`./`, `../`)
- Sort alphabetically within groups

### Naming Conventions
- **Components**: PascalCase (e.g., `ItemCard`, `SearchBar`)
- **Hooks**: camelCase with `use` prefix (e.g., `useItems`, `useSearch`)
- **Files**: kebab-case for utilities, PascalCase for components
- **Constants**: SCREAMING_SNAKE_CASE for config values, camelCase for runtime
- **Types/Interfaces**: PascalCase (e.g., `ItemType`, `UserProfile`)

### React Patterns
- Use Server Components by default; add `'use client'` only when needed
- Use `useActionState` for form handling
- Implement optimistic updates for better UX
- Prefer composition over inheritance

### Error Handling
- Use try/catch with async operations
- Return meaningful error messages
- Handle errors at boundary components
- Never expose sensitive information in error messages

### Tailwind CSS v4
- Use new v4 syntax: `@import "tailwindcss"` (no `@tailwind` directives)
- Use `@theme inline` for custom theme values
- Use CSS variables for colors: `var(--background)`, `var(--foreground)`
- Support dark mode via `prefers-color-scheme` media query

### Database (Prisma)
- Never use `db push` in production - use migrations instead
- Use `npx prisma migrate dev --name migration_name`
- Use Prisma's `select` to limit query fields for performance
- Implement proper cascading deletes

---

## 5. ESLint & Prettier

The project uses ESLint flat config with:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Run linting before committing:
```bash
npm run lint
```

---

## 6. Environment Variables

Required variables (see `.env.example` or documentation):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Auth callback URL
- `NEXTAUTH_SECRET` - Auth secret key

Optional:
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - OAuth
- `R2_*` - Cloudflare R2 for file storage
- `OPENAI_API_KEY` - OpenAI for AI features
- `STRIPE_*` - Stripe for payments

---

## 7. Key Conventions

### API Routes
- All API routes require authentication (use Next-Auth session)
- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Validate inputs with Zod schemas (add to `lib/validations.ts`)
- Return consistent response formats

### Component Structure
```tsx
// Client component example
'use client';

import { useState } from 'react';
import { SomeIcon } from 'lucide-react';

interface Props {
  title: string;
  onSubmit: (value: string) => void;
}

export function SomeComponent({ title, onSubmit }: Props) {
  const [value, setValue] = useState('');

  return (
    <div>
      {/* content */}
    </div>
  );
}
```

### Color Palette (from design system)
| Type | Color | Hex |
|------|-------|-----|
| Snippet | Blue | `#3b82f6` |
| Prompt | Purple | `#8b5cf6` |
| Command | Orange | `#f97316` |
| Note | Yellow | `#fde047` |
| Link | Emerald | `#10b981` |

---

## 8. Getting Started for New Development

1. Install dependencies: `npm install`
2. Set up environment variables
3. Set up database: `npx prisma db push` (dev) or migrate
4. Run dev server: `npm run dev`
5. Verify build: `npm run build`

---

## 9. Additional Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [ShadCN UI](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
