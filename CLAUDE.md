# DevStash
a developer knowladge hub , where he can save files, images, notes, links, snippits, commants, prompts and custome types

## Context files 
read the following to get the full context of the project 
- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `npm run dev` - Start the development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint on the codebase

## Architecture

This is a Next.js 16 project using the App Router pattern.

### Technology Stack

- **Framework**: Next.js 16.1.6 with App Router
- **React**: 19.2.3 (with React Compiler enabled in `next.config.ts`)
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Font**: Geist (Sans and Mono) via `next/font/google`

### Project Structure

```
app/
├── layout.tsx      # Root layout with Geist font configuration
├── page.tsx        # Home page component
├── globals.css     # Global styles with Tailwind v4 import
└── favicon.ico
public/             # Static assets (SVGs)
```

### Key Configuration Details

**Tailwind CSS v4**: Uses the new v4 syntax in `app/globals.css`:
- `@import "tailwindcss"` instead of directives
- `@theme inline` for theme customization
- CSS variables for theming (`--background`, `--foreground`)

**Path Aliases**: `@/*` maps to `./*` (project root)

**ESLint**: Uses flat config format (`eslint.config.mjs`) with:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

**TypeScript**: Configured with:
- `moduleResolution: "bundler"`
- `jsx: "react-jsx"`
- Strict mode enabled

### Development Notes

- The project uses the React Compiler (Babel plugin) for automatic memoization
- Dark mode is supported via `prefers-color-scheme` media query
- The Geist font is loaded via CSS variables (`--font-geist-sans`, `--font-geist-mono`)
