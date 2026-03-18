# Current Feature

Seed Database with Full Development Data

## Status

Complete

## Tasks

- [x] Install `bcryptjs` for password hashing
- [x] Seed demo user (demo@devstash.io, password: 12345678, isPro: false)
- [x] Seed 7 system ItemTypes (already exists, keep as-is)
- [x] Seed 15 tags from lib/data.ts (javascript, react, typescript, etc.)
- [x] Seed 5 collections per spec:
  - [x] React Patterns (3 snippets)
  - [x] AI Workflows (3 prompts)
  - [x] DevOps (1 snippet, 1 command, 2 links)
  - [x] Terminal Commands (4 commands)
  - [x] Design Resources (4 links)
- [x] Link items to relevant tags (ItemTag)
- [x] Run `prisma db seed` and verify
- [x] Update `context/current-feature.md`

## Goals

- Populate database with realistic demo data for development
- Reuse content from `lib/data.ts` where applicable
- Follow the spec in `context/features/seed-spec.md`
- Include tag-to-item relationships

## Notes

- Password hashed with bcryptjs (12 rounds)
- Reuse code content from `lib/data.ts` snippets, prompts, commands, links
- Adapt item content to match spec collections
- User emailVerified set to current date
- Tags are created standalone, then linked to items via ItemTag

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard Phase 3: Welcome header, Pinned Collections grid, Recent Items with grid/list toggle
- Refactored dashboard components to use shadcn/ui Button component
- Prisma ORM v7 Setup: Database schema, migrations, seeding with system ItemTypes
- Seed Database: Demo user, 15 tags, 5 collections with 15 items and tag relationships
