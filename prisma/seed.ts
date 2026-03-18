import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...\n')

  // ─── 1. System ItemTypes ───
  console.log('Seeding system ItemTypes...')

  const systemTypes = [
    { name: 'snippet', icon: 'Code', color: '#3b82f6' },
    { name: 'prompt', icon: 'Sparkles', color: '#8b5cf6' },
    { name: 'command', icon: 'Terminal', color: '#f97316' },
    { name: 'note', icon: 'StickyNote', color: '#fde047' },
    { name: 'file', icon: 'File', color: '#6b7280' },
    { name: 'image', icon: 'Image', color: '#ec4899' },
    { name: 'link', icon: 'Link', color: '#10b981' },
  ]

  for (const type of systemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true },
    })
    if (!existing) {
      await prisma.itemType.create({
        data: { ...type, isSystem: true },
      })
      console.log(`  Created: ${type.name}`)
    } else {
      console.log(`  Skipped (exists): ${type.name}`)
    }
  }

  // ─── 2. Demo User ───
  console.log('\nSeeding demo user...')

  const hashedPassword = await bcrypt.hash('12345678', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@devstash.io' },
    update: {
      password: hashedPassword,
      name: 'Demo User',
      isPro: false,
      emailVerified: new Date(),
    },
    create: {
      email: 'demo@devstash.io',
      password: hashedPassword,
      name: 'Demo User',
      isPro: false,
      emailVerified: new Date(),
    },
  })
  console.log(`  User: ${user.email} (id: ${user.id})`)

  // ─── 3. Tags ───
  console.log('\nSeeding tags...')

  const tagNames = [
    'javascript',
    'react',
    'typescript',
    'python',
    'ai',
    'cli',
    'git',
    'docker',
    'css',
    'database',
    'api',
    'tutorial',
    'reference',
    'productivity',
    'testing',
  ]

  const tags: Record<string, string> = {}
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    tags[name] = tag.id
  }
  console.log(`  Created ${Object.keys(tags).length} tags`)

  // ─── 4. Fetch ItemType IDs ───
  const itemTypeMap: Record<string, string> = {}
  for (const type of systemTypes) {
    const itemType = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true },
    })
    if (itemType) {
      itemTypeMap[type.name] = itemType.id
    }
  }

  // ─── 5. Collections & Items ───
  console.log('\nSeeding collections and items...\n')

  // Helper to create items with tag connections
  async function createItem(
    data: Parameters<typeof prisma.item.create>[0]['data'],
    tagNamesToConnect: string[]
  ) {
    const item = await prisma.item.create({
      data: {
        ...data,
        tags: {
          create: tagNamesToConnect.map((tagName) => ({
            tag: { connect: { id: tags[tagName] } },
          })),
        },
      },
    })
    return item
  }

  // ── React Patterns (3 snippets) ──
  console.log('  Collection: React Patterns')
  const reactPatterns = await prisma.collection.create({
    data: {
      name: 'React Patterns',
      description: 'Reusable React patterns and hooks',
      isFavorite: true,
      defaultTypeId: itemTypeMap.snippet,
      userId: user.id,
    },
  })

  // Snippet 1: Custom hooks
  const rpItem1 = await createItem(
    {
      title: 'Custom React Hooks',
      contentType: 'TEXT',
      content: `import { useState, useEffect, useCallback } from 'react';

// useDebounce - Debounce a value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// useLocalStorage - Persist state to localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}

// useToggle - Boolean toggle hook
export function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
}`,
      description: 'Collection of custom React hooks: useDebounce, useLocalStorage, useToggle',
      isFavorite: true,
      language: 'typescript',
      userId: user.id,
      itemTypeId: itemTypeMap.snippet,
    },
    ['react', 'typescript']
  )

  // Snippet 2: Component patterns
  const rpItem2 = await createItem(
    {
      title: 'Component Patterns',
      contentType: 'TEXT',
      content: `import { createContext, useContext, useState, type ReactNode } from 'react';

// Context Provider Pattern
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// Compound Component Pattern
interface TabsProps {
  children: ReactNode;
  defaultIndex?: number;
}

export function Tabs({ children, defaultIndex = 0 }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  return (
    <div data-active={activeIndex} onClick={() => setActiveIndex((i) => i)}>
      {children}
    </div>
  );
}`,
      description: 'React context providers and compound component patterns',
      isFavorite: false,
      language: 'typescript',
      userId: user.id,
      itemTypeId: itemTypeMap.snippet,
    },
    ['react', 'typescript']
  )

  // Snippet 3: Utility functions
  const rpItem3 = await createItem(
    {
      title: 'React Utility Functions',
      contentType: 'TEXT',
      content: `import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// cn - Merge Tailwind classes (used with shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// formatDate - Format date for display
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// truncate - Truncate string with ellipsis
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// groupBy - Group array items by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// sleep - Promise-based delay
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}`,
      description: 'Common utility functions for React apps: cn, formatDate, truncate, groupBy',
      isFavorite: false,
      language: 'typescript',
      userId: user.id,
      itemTypeId: itemTypeMap.snippet,
    },
    ['react', 'typescript']
  )

  await prisma.itemCollection.createMany({
    data: [
      { itemId: rpItem1.id, collectionId: reactPatterns.id },
      { itemId: rpItem2.id, collectionId: reactPatterns.id },
      { itemId: rpItem3.id, collectionId: reactPatterns.id },
    ],
  })
  console.log('    + 3 snippets')

  // ── AI Workflows (3 prompts) ──
  console.log('  Collection: AI Workflows')
  const aiWorkflows = await prisma.collection.create({
    data: {
      name: 'AI Workflows',
      description: 'AI prompts and workflow automations',
      isFavorite: true,
      defaultTypeId: itemTypeMap.prompt,
      userId: user.id,
    },
  })

  // Prompt 1: Code review
  const aiItem1 = await createItem(
    {
      title: 'Code Review Prompt',
      contentType: 'TEXT',
      content: `You are a senior software engineer conducting a thorough code review. Analyze the following code for:

1. **Bugs & Edge Cases** - Potential runtime errors, null/undefined issues, race conditions
2. **Performance** - Unnecessary re-renders, N+1 queries, memory leaks, inefficient algorithms
3. **Security** - XSS, SQL injection, CSRF, exposed secrets, insecure dependencies
4. **Code Quality** - Naming, structure, readability, DRY violations, complexity
5. **Best Practices** - Framework conventions, design patterns, error handling

For each issue found:
- Severity: Critical / Warning / Suggestion
- Location: File and line reference
- Issue: What's wrong
- Fix: Suggested improvement with code example

Code to review:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
      description: 'Comprehensive code review prompt for quality and security analysis',
      isFavorite: true,
      language: 'markdown',
      userId: user.id,
      itemTypeId: itemTypeMap.prompt,
    },
    ['ai', 'testing']
  )

  // Prompt 2: Documentation generation
  const aiItem2 = await createItem(
    {
      title: 'Documentation Generator',
      contentType: 'TEXT',
      content: `Generate clear, professional documentation for the following code. Structure it as follows:

## Overview
- What this code does and why it exists
- Key concepts or patterns used

## Installation
- Dependencies required
- Setup instructions

## Usage
- Basic usage examples with code
- Common use cases
- Configuration options (if any)

## API Reference
- Function/method signatures
- Parameters with types and descriptions
- Return values with types
- Exceptions/errors thrown

## Examples
- 2-3 practical examples covering different scenarios
- Include expected output where applicable

## Notes
- Gotchas or common pitfalls
- Performance considerations
- Compatibility information

Use Markdown formatting. Be concise but thorough. Include type annotations for TypeScript.

Code to document:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
      description: 'Generate structured documentation from code',
      isFavorite: false,
      language: 'markdown',
      userId: user.id,
      itemTypeId: itemTypeMap.prompt,
    },
    ['ai', 'productivity']
  )

  // Prompt 3: Refactoring assistance
  const aiItem3 = await createItem(
    {
      title: 'Refactoring Assistant',
      contentType: 'TEXT',
      content: `Analyze the following code and suggest refactoring improvements. Focus on:

## Design Patterns
- Identify anti-patterns and suggest appropriate design patterns
- Look for opportunities to apply SOLID principles

## Code Smells
- Long methods/functions (should be < 30 lines)
- Deep nesting (should be < 3 levels)
- Magic numbers/strings
- Duplicate code
- God objects/components

## Abstraction Opportunities
- Extract reusable functions/hooks/components
- Suggest appropriate interfaces/types
- Identify shared logic that can be generalized

## Performance Optimizations
- Memoization opportunities
- Lazy loading candidates
- Bundle size optimizations

## Readability
- Variable/function naming improvements
- Code organization suggestions
- Comment placement

For each suggestion:
1. **Issue**: What needs refactoring
2. **Why**: The problem it causes
3. **Solution**: Refactored code with explanation
4. **Benefit**: What improves

Code to refactor:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
      description: 'Systematic refactoring suggestions with before/after code',
      isFavorite: false,
      language: 'markdown',
      userId: user.id,
      itemTypeId: itemTypeMap.prompt,
    },
    ['ai']
  )

  await prisma.itemCollection.createMany({
    data: [
      { itemId: aiItem1.id, collectionId: aiWorkflows.id },
      { itemId: aiItem2.id, collectionId: aiWorkflows.id },
      { itemId: aiItem3.id, collectionId: aiWorkflows.id },
    ],
  })
  console.log('    + 3 prompts')

  // ── DevOps (1 snippet, 1 command, 2 links) ──
  console.log('  Collection: DevOps')
  const devops = await prisma.collection.create({
    data: {
      name: 'DevOps',
      description: 'Infrastructure and deployment resources',
      isFavorite: false,
      userId: user.id,
    },
  })

  // Snippet: Docker/CI-CD config
  const devopsItem1 = await createItem(
    {
      title: 'Multi-Stage Dockerfile',
      contentType: 'TEXT',
      content: `# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]`,
      description: 'Optimized multi-stage Dockerfile for Next.js applications',
      isFavorite: false,
      language: 'dockerfile',
      userId: user.id,
      itemTypeId: itemTypeMap.snippet,
    },
    ['docker']
  )

  // Command: Deployment scripts
  const devopsItem2 = await createItem(
    {
      title: 'Deployment Commands',
      contentType: 'TEXT',
      content: `# Build and push Docker image
docker build -t myapp:latest .
docker tag myapp:latest registry.example.com/myapp:latest
docker push registry.example.com/myapp:latest

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl rollout status deployment/myapp

# Rollback deployment
kubectl rollout undo deployment/myapp

# Check pod status
kubectl get pods -l app=myapp
kubectl logs -l app=myapp --tail=100 -f

# Scale deployment
kubectl scale deployment/myapp --replicas=3

# Health check
curl -f http://localhost:3000/api/health || exit 1`,
      description: 'Docker and Kubernetes deployment commands',
      isFavorite: false,
      language: 'bash',
      userId: user.id,
      itemTypeId: itemTypeMap.command,
    },
    ['docker', 'cli']
  )

  // Link 1: Docker documentation
  const devopsItem3 = await createItem(
    {
      title: 'Docker Documentation',
      contentType: 'TEXT',
      url: 'https://docs.docker.com/',
      content: 'https://docs.docker.com/',
      description: 'Official Docker documentation - guides, references, and best practices',
      isFavorite: false,
      userId: user.id,
      itemTypeId: itemTypeMap.link,
    },
    ['docker', 'reference']
  )

  // Link 2: GitHub Actions
  const devopsItem4 = await createItem(
    {
      title: 'GitHub Actions Documentation',
      contentType: 'TEXT',
      url: 'https://docs.github.com/en/actions',
      content: 'https://docs.github.com/en/actions',
      description: 'GitHub Actions for CI/CD automation - workflows, runners, and marketplace',
      isFavorite: false,
      userId: user.id,
      itemTypeId: itemTypeMap.link,
    },
    ['api', 'reference']
  )

  await prisma.itemCollection.createMany({
    data: [
      { itemId: devopsItem1.id, collectionId: devops.id },
      { itemId: devopsItem2.id, collectionId: devops.id },
      { itemId: devopsItem3.id, collectionId: devops.id },
      { itemId: devopsItem4.id, collectionId: devops.id },
    ],
  })
  console.log('    + 1 snippet, 1 command, 2 links')

  // ── Terminal Commands (4 commands) ──
  console.log('  Collection: Terminal Commands')
  const terminalCommands = await prisma.collection.create({
    data: {
      name: 'Terminal Commands',
      description: 'Useful shell commands for everyday development',
      isFavorite: false,
      userId: user.id,
    },
  })

  // Command 1: Git operations
  const tcItem1 = await createItem(
    {
      title: 'Git Operations',
      contentType: 'TEXT',
      content: `# Undo last commit but keep changes staged
git reset --soft HEAD~1

# Amend last commit message
git commit --amend -m "New commit message"

# Interactive rebase (last 5 commits)
git rebase -i HEAD~5

# Stash changes with message
git stash push -m "WIP: feature description"

# Apply stash and remove from stash list
git stash pop

# Cherry-pick a commit
git cherry-pick <commit-hash>

# View file changes between branches
git diff main..feature-branch -- path/to/file

# Find which commit introduced a bug (bisect)
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>

# Clean untracked files and directories
git clean -fd

# Create and switch to new branch
git checkout -b feature/new-feature`,
      description: 'Essential Git commands for daily workflow',
      isFavorite: true,
      language: 'bash',
      userId: user.id,
      itemTypeId: itemTypeMap.command,
    },
    ['git', 'cli']
  )

  // Command 2: Docker commands
  const tcItem2 = await createItem(
    {
      title: 'Docker Commands',
      contentType: 'TEXT',
      content: `# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -af

# Remove unused volumes (DANGEROUS - deletes data)
docker volume prune -f

# Run container with port mapping
docker run -d -p 3000:3000 --name myapp myapp:latest

# Execute command in running container
docker exec -it myapp /bin/sh

# View container logs
docker logs -f --tail 100 myapp

# Copy file from container
docker cp myapp:/app/data.json ./data.json

# View disk usage
docker system df

# Nuclear option: remove everything unused
docker system prune -af --volumes

# List running containers with resource usage
docker stats --no-stream`,
      description: 'Docker container management and cleanup commands',
      isFavorite: false,
      language: 'bash',
      userId: user.id,
      itemTypeId: itemTypeMap.command,
    },
    ['docker', 'cli']
  )

  // Command 3: Process management
  const tcItem3 = await createItem(
    {
      title: 'Process Management',
      contentType: 'TEXT',
      content: `# Find process using a port
lsof -i :3000
# or
ss -tlnp | grep 3000

# Kill process by port
kill $(lsof -t -i:3000)

# Kill process by name
pkill -f "node server.js"

# List all Node.js processes
ps aux | grep node

# Monitor system resources
top
htop  # if installed

# Kill process tree (all child processes)
kill -TERM -<parent-pid>

# Run command in background
nohup node server.js &

# View running background jobs
jobs -l

# Bring background job to foreground
fg %1`,
      description: 'Linux/macOS process management and debugging',
      isFavorite: false,
      language: 'bash',
      userId: user.id,
      itemTypeId: itemTypeMap.command,
    },
    ['cli']
  )

  // Command 4: Package manager utilities
  const tcItem4 = await createItem(
    {
      title: 'Package Manager Utilities',
      contentType: 'TEXT',
      content: `# ─── npm ───
# Update all dependencies to latest
npx npm-check-updates -u && npm install

# Check for outdated packages
npm outdated

# Clear cache
npm cache clean --force

# List globally installed packages
npm list -g --depth=0

# ─── pnpm ───
# Faster alternative to npm
pnpm install
pnpm add package-name
pnpm remove package-name

# ─── bun ───
# Ultra-fast package manager
bun install
bun add package-name

# ─── Common ───
# Run script with environment variables
NODE_ENV=production npm start

# Install specific version
npm install package@1.2.3

# Audit for vulnerabilities
npm audit
npm audit fix`,
      description: 'npm, pnpm, and bun commands for package management',
      isFavorite: false,
      language: 'bash',
      userId: user.id,
      itemTypeId: itemTypeMap.command,
    },
    ['cli', 'productivity']
  )

  await prisma.itemCollection.createMany({
    data: [
      { itemId: tcItem1.id, collectionId: terminalCommands.id },
      { itemId: tcItem2.id, collectionId: terminalCommands.id },
      { itemId: tcItem3.id, collectionId: terminalCommands.id },
      { itemId: tcItem4.id, collectionId: terminalCommands.id },
    ],
  })
  console.log('    + 4 commands')

  // ── Design Resources (4 links) ──
  console.log('  Collection: Design Resources')
  const designResources = await prisma.collection.create({
    data: {
      name: 'Design Resources',
      description: 'UI/UX resources and references',
      isFavorite: false,
      userId: user.id,
    },
  })

  // Link 1: CSS/Tailwind references
  const drItem1 = await createItem(
    {
      title: 'Tailwind CSS Documentation',
      contentType: 'TEXT',
      url: 'https://tailwindcss.com/docs',
      content: 'https://tailwindcss.com/docs',
      description: 'Official Tailwind CSS v4 documentation with all utility classes and configuration',
      isFavorite: true,
      userId: user.id,
      itemTypeId: itemTypeMap.link,
    },
    ['css', 'reference']
  )

  // Link 2: Component libraries
  const drItem2 = await createItem(
    {
      title: 'shadcn/ui Components',
      contentType: 'TEXT',
      url: 'https://ui.shadcn.com',
      content: 'https://ui.shadcn.com',
      description: 'Beautifully designed components built with Radix UI and Tailwind CSS',
      isFavorite: true,
      userId: user.id,
      itemTypeId: itemTypeMap.link,
    },
    ['react', 'reference']
  )

  // Link 3: Design systems
  const drItem3 = await createItem(
    {
      title: 'Radix UI Primitives',
      contentType: 'TEXT',
      url: 'https://www.radix-ui.com/primitives',
      content: 'https://www.radix-ui.com/primitives',
      description: 'Unstyled, accessible UI primitives for building high-quality design systems',
      isFavorite: false,
      userId: user.id,
      itemTypeId: itemTypeMap.link,
    },
    ['react', 'reference']
  )

  // Link 4: Icon libraries
  const drItem4 = await createItem(
    {
      title: 'Lucide Icons',
      contentType: 'TEXT',
      url: 'https://lucide.dev',
      content: 'https://lucide.dev',
      description: 'Beautiful & consistent icons - fork of Feather Icons with 1000+ icons',
      isFavorite: true,
      userId: user.id,
      itemTypeId: itemTypeMap.link,
    },
    ['reference']
  )

  await prisma.itemCollection.createMany({
    data: [
      { itemId: drItem1.id, collectionId: designResources.id },
      { itemId: drItem2.id, collectionId: designResources.id },
      { itemId: drItem3.id, collectionId: designResources.id },
      { itemId: drItem4.id, collectionId: designResources.id },
    ],
  })
  console.log('    + 4 links')

  // ─── Summary ───
  console.log('\n✅ Seed complete!')
  console.log('─────────────────────────────')
  console.log(`User:         1 (demo@devstash.io)`)
  console.log(`ItemTypes:    ${systemTypes.length} (system)`)
  console.log(`Tags:         ${Object.keys(tags).length}`)
  console.log(`Collections:  5`)
  console.log(`Items:        15`)
  console.log(`  - Snippets: 4`)
  console.log(`  - Prompts:  3`)
  console.log(`  - Commands: 5`)
  console.log(`  - Links:    3`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
