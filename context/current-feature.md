# Current Feature

Prisma ORM v7 Setup with Database Schema and Seeding

## Status

Completed

## Tasks

- [x] Create `prisma/schema.prisma` with all models (User, Account, Session, VerificationToken, Item, ItemType, Collection, ItemCollection, Tag, ItemTag)
- [x] Create `src/lib/prisma.ts` singleton client configuration
- [x] Set up environment variables for DATABASE_URL
- [x] Create `prisma/seed.ts` with 7 system ItemTypes
- [x] Add seed script to package.json
- [x] Create initial migration with `prisma migrate dev --name init`
- [x] Run `prisma db seed` to populate system types
- [x] Verify migration status with `prisma migrate status`

## Goals

- Set up Prisma ORM v7 with Neon PostgreSQL
- Implement complete database schema matching project ERD
- Configure PrismaClient singleton with hot reload support
- Seed system ItemTypes (snippet, prompt, command, note, file, image, link)
- Follow migration-based workflow (no db push)

## Notes

- Using Prisma v7 latest
- Database: Neon PostgreSQL
- All IDs use CUID format
- System types have isSystem=true and userId=null
- Relations use onDelete: Cascade
- Text fields use @db.Text for long content

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard Phase 3: Welcome header, Pinned Collections grid, Recent Items with grid/list toggle
- Refactored dashboard components to use shadcn/ui Button component
- Prisma ORM v7 Setup: Database schema, migrations, seeding with system ItemTypes
