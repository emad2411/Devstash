// Mock data for DevStash testing
// Based on the database schema from project-overview.md

export type ContentType = 'TEXT' | 'FILE';

export interface ItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
  userId?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  defaultTypeId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  title: string;
  contentType: ContentType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  description?: string;
  isFavorite: boolean;
  isPinned: boolean;
  language?: string;
  userId: string;
  itemTypeId: string;
  itemType?: ItemType;
  tags?: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

// System Item Types (based on project spec)
export const mockItemTypes: ItemType[] = [
  { id: 'type_snippet', name: 'snippet', icon: 'Code', color: '#3b82f6', isSystem: true },
  { id: 'type_prompt', name: 'prompt', icon: 'Sparkles', color: '#8b5cf6', isSystem: true },
  { id: 'type_command', name: 'command', icon: 'Terminal', color: '#f97316', isSystem: true },
  { id: 'type_note', name: 'note', icon: 'StickyNote', color: '#fde047', isSystem: true },
  { id: 'type_file', name: 'file', icon: 'File', color: '#6b7280', isSystem: true },
  { id: 'type_image', name: 'image', icon: 'Image', color: '#ec4899', isSystem: true },
  { id: 'type_link', name: 'link', icon: 'Link', color: '#10b981', isSystem: true },
];

// Mock Tags
export const mockTags: Tag[] = [
  { id: 'tag_1', name: 'javascript' },
  { id: 'tag_2', name: 'react' },
  { id: 'tag_3', name: 'typescript' },
  { id: 'tag_4', name: 'python' },
  { id: 'tag_5', name: 'ai' },
  { id: 'tag_6', name: 'cli' },
  { id: 'tag_7', name: 'git' },
  { id: 'tag_8', name: 'docker' },
  { id: 'tag_9', name: 'css' },
  { id: 'tag_10', name: 'database' },
  { id: 'tag_11', name: 'api' },
  { id: 'tag_12', name: 'tutorial' },
  { id: 'tag_13', name: 'reference' },
  { id: 'tag_14', name: 'productivity' },
  { id: 'tag_15', name: 'testing' },
];

// Mock Collections
export const mockCollections: Collection[] = [
  {
    id: 'coll_1',
    name: 'Frontend Essentials',
    description: 'Essential code snippets for frontend development',
    isFavorite: true,
    defaultTypeId: 'type_snippet',
    userId: 'user_1',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'coll_2',
    name: 'AI Prompts',
    description: 'Useful AI prompts for development tasks',
    isFavorite: true,
    defaultTypeId: 'type_prompt',
    userId: 'user_1',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-03-12'),
  },
  {
    id: 'coll_3',
    name: 'DevOps Commands',
    description: 'Docker, Git, and deployment commands',
    isFavorite: false,
    defaultTypeId: 'type_command',
    userId: 'user_1',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-28'),
  },
  {
    id: 'coll_4',
    name: 'Learning Resources',
    description: 'Tutorials and documentation links',
    isFavorite: false,
    defaultTypeId: 'type_link',
    userId: 'user_1',
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-03-05'),
  },
  {
    id: 'coll_5',
    name: 'Project Notes',
    description: 'Random notes and ideas',
    isFavorite: false,
    defaultTypeId: 'type_note',
    userId: 'user_1',
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-03-08'),
  },
];

// Mock Items - Snippets (Blue)
const snippetItems: Item[] = [
  {
    id: 'item_snippet_1',
    title: 'React useEffect Hook',
    contentType: 'TEXT',
    content: `import { useEffect, useState } from 'react';

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}`,
    description: 'Custom hook to track window dimensions',
    isFavorite: true,
    isPinned: true,
    language: 'typescript',
    userId: 'user_1',
    itemTypeId: 'type_snippet',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-03-01'),
  },
  {
    id: 'item_snippet_2',
    title: 'Debounce Function',
    contentType: 'TEXT',
    content: `function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Usage
const debouncedSearch = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);`,
    description: 'TypeScript debounce implementation',
    isFavorite: true,
    isPinned: false,
    language: 'typescript',
    userId: 'user_1',
    itemTypeId: 'type_snippet',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-20'),
  },
  {
    id: 'item_snippet_3',
    title: 'Fetch with Retry',
    contentType: 'TEXT',
    content: `async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}`,
    description: 'Fetch wrapper with exponential backoff retry',
    isFavorite: false,
    isPinned: false,
    language: 'typescript',
    userId: 'user_1',
    itemTypeId: 'type_snippet',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: 'item_snippet_4',
    title: 'CSS Grid Centering',
    contentType: 'TEXT',
    content: `.center-container {
  display: grid;
  place-items: center;
  min-height: 100vh;
}

/* Alternative with flexbox */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}`,
    description: 'Simple centering techniques',
    isFavorite: false,
    isPinned: false,
    language: 'css',
    userId: 'user_1',
    itemTypeId: 'type_snippet',
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    id: 'item_snippet_5',
    title: 'Python List Comprehension',
    contentType: 'TEXT',
    content: `# Basic list comprehension
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]

# With condition
evens = [x for x in numbers if x % 2 == 0]

# Dictionary comprehension
square_dict = {x: x**2 for x in numbers}

# Nested comprehension
matrix = [[i*j for j in range(3)] for i in range(3)]`,
    description: 'Python list and dict comprehension examples',
    isFavorite: true,
    isPinned: false,
    language: 'python',
    userId: 'user_1',
    itemTypeId: 'type_snippet',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-10'),
  },
  {
    id: 'item_snippet_6',
    title: 'SQL Common Queries',
    contentType: 'TEXT',
    content: `-- Select with join
SELECT u.name, u.email, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.active = true
ORDER BY u.created_at DESC;

-- Update with returning
UPDATE users
SET last_login = NOW()
WHERE id = $1
RETURNING *;

-- Insert on conflict
INSERT INTO users (email, name)
VALUES ($1, $2)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name;`,
    description: 'Common PostgreSQL query patterns',
    isFavorite: false,
    isPinned: false,
    language: 'sql',
    userId: 'user_1',
    itemTypeId: 'type_snippet',
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-05'),
  },
];

// Mock Items - Prompts (Purple)
const promptItems: Item[] = [
  {
    id: 'item_prompt_1',
    title: 'Code Review Assistant',
    contentType: 'TEXT',
    content: `You are a senior software engineer conducting a code review. Review the following code for:
1. Potential bugs or edge cases
2. Performance issues
3. Security vulnerabilities
4. Code style and best practices
5. Maintainability and readability

Provide specific, actionable feedback with code examples where appropriate.

Code to review:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
    description: 'Prompt for reviewing code changes',
    isFavorite: true,
    isPinned: true,
    userId: 'user_1',
    itemTypeId: 'type_prompt',
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-03-05'),
  },
  {
    id: 'item_prompt_2',
    title: 'Explain Like I\'m 5',
    contentType: 'TEXT',
    content: `Explain the following concept as if I'm a complete beginner with no technical background. Use analogies, simple language, and avoid jargon. If you must use technical terms, define them clearly.

Concept: [TOPIC]

Structure your answer:
1. One sentence summary
2. Real-world analogy
3. Simple explanation
4. Common use cases
5. Why it matters`,
    description: 'Simplify complex technical concepts',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_prompt',
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-02-25'),
  },
  {
    id: 'item_prompt_3',
    title: 'Test Case Generator',
    contentType: 'TEXT',
    content: `Generate comprehensive test cases for the following function/code. Include:

1. Happy path tests (normal expected usage)
2. Edge cases (empty inputs, null values, extreme values)
3. Error cases (invalid inputs, expected failures)
4. Boundary value tests
5. Integration scenarios if applicable

For each test case provide:
- Test name
- Input
- Expected output
- Description of what it tests

Code to test:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
    description: 'Generate test cases for functions',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_prompt',
    createdAt: new Date('2026-01-22'),
    updatedAt: new Date('2026-01-22'),
  },
  {
    id: 'item_prompt_4',
    title: 'Documentation Writer',
    contentType: 'TEXT',
    content: `Write clear, concise documentation for the following code. Include:

1. Overview - what this does and why it exists
2. Installation/setup if needed
3. Usage examples with code
4. API reference (parameters, return values, types)
5. Common pitfalls or gotchas

Use Markdown formatting. Be concise but thorough.

Code to document:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
    description: 'Generate documentation from code',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_prompt',
    createdAt: new Date('2026-01-28'),
    updatedAt: new Date('2026-02-18'),
  },
  {
    id: 'item_prompt_5',
    title: 'Refactoring Suggestions',
    contentType: 'TEXT',
    content: `Analyze the following code and suggest refactoring improvements. Focus on:

1. Design patterns that could be applied
2. Code smells and how to fix them
3. Opportunities for abstraction
4. Performance optimizations
5. Readability improvements

For each suggestion:
- Identify the issue
- Explain why it's a problem
- Provide the refactored code
- Explain the benefits

Code to refactor:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
    description: 'Get refactoring advice for code',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_prompt',
    createdAt: new Date('2026-02-03'),
    updatedAt: new Date('2026-02-28'),
  },
];

// Mock Items - Commands (Orange)
const commandItems: Item[] = [
  {
    id: 'item_command_1',
    title: 'Git Undo Last Commit',
    contentType: 'TEXT',
    content: `# Undo last commit but keep changes staged
git reset --soft HEAD~1

# Undo last commit and unstage changes
git reset HEAD~1

# Undo last commit and discard changes (DANGEROUS)
git reset --hard HEAD~1

# Amend last commit (change message or add files)
git commit --amend -m "New message"`,
    description: 'Various ways to undo the last commit',
    isFavorite: true,
    isPinned: true,
    language: 'bash',
    userId: 'user_1',
    itemTypeId: 'type_command',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'item_command_2',
    title: 'Docker Cleanup',
    contentType: 'TEXT',
    content: `# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Nuclear option: remove everything unused
docker system prune -f --volumes

# See disk usage
docker system df`,
    description: 'Clean up Docker resources',
    isFavorite: true,
    isPinned: false,
    language: 'bash',
    userId: 'user_1',
    itemTypeId: 'type_command',
    createdAt: new Date('2026-01-14'),
    updatedAt: new Date('2026-02-22'),
  },
  {
    id: 'item_command_3',
    title: 'Find and Replace in Files',
    contentType: 'TEXT',
    content: `# Find and replace in single file with sed
sed -i 's/old-text/new-text/g' file.txt

# Find and replace in all files recursively
find . -type f -name "*.js" -exec sed -i 's/foo/bar/g' {} +

# Using ripgrep and sd (modern alternative)
rg 'old-pattern' -l | xargs sd 'old-pattern' 'new-pattern'

# Replace in files with git tracking (safer)
git ls-files | xargs sed -i 's/old/new/g'`,
    description: 'Find and replace text in files',
    isFavorite: false,
    isPinned: false,
    language: 'bash',
    userId: 'user_1',
    itemTypeId: 'type_command',
    createdAt: new Date('2026-01-19'),
    updatedAt: new Date('2026-01-19'),
  },
  {
    id: 'item_command_4',
    title: 'NPM Quick Commands',
    contentType: 'TEXT',
    content: `# Update all dependencies to latest
npx npm-check-updates -u && npm install

# Check for outdated packages
npm outdated

# Clear npm cache
npm cache clean --force

# List globally installed packages
npm list -g --depth=0

# Run script with environment variables
NODE_ENV=production npm start

# Install specific version
npm install package@1.2.3`,
    description: 'Useful NPM commands',
    isFavorite: false,
    isPinned: false,
    language: 'bash',
    userId: 'user_1',
    itemTypeId: 'type_command',
    createdAt: new Date('2026-01-24'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    id: 'item_command_5',
    title: 'SSH Key Management',
    contentType: 'TEXT',
    content: `# Generate new SSH key
ssh-keygen -t ed25519 -C "your@email.com"

# Add key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard (macOS)
pbcopy < ~/.ssh/id_ed25519.pub

# Copy public key to clipboard (Linux)
xclip -sel clip < ~/.ssh/id_ed25519.pub

# Test SSH connection
ssh -T git@github.com

# List SSH keys
ls -la ~/.ssh/`,
    description: 'SSH key generation and management',
    isFavorite: true,
    isPinned: false,
    language: 'bash',
    userId: 'user_1',
    itemTypeId: 'type_command',
    createdAt: new Date('2026-01-30'),
    updatedAt: new Date('2026-03-01'),
  },
  {
    id: 'item_command_6',
    title: 'PostgreSQL Quick Commands',
    contentType: 'TEXT',
    content: `# Connect to database
psql -U username -d database_name

# List all databases
\\l

# List all tables
\\dt

# Describe table
\\d table_name

# Export query to CSV
\\copy (SELECT * FROM users) TO '/path/to/file.csv' CSV HEADER;

# Show query timing
\\timing

# Exit
\\q`,
    description: 'Common PostgreSQL CLI commands',
    isFavorite: false,
    isPinned: false,
    language: 'bash',
    userId: 'user_1',
    itemTypeId: 'type_command',
    createdAt: new Date('2026-02-04'),
    updatedAt: new Date('2026-02-04'),
  },
];

// Mock Items - Notes (Yellow)
const noteItems: Item[] = [
  {
    id: 'item_note_1',
    title: 'Project Ideas 2026',
    contentType: 'TEXT',
    content: `# Project Ideas

## SaaS Ideas
1. **AI Code Reviewer** - Automated PR reviews with suggestions
2. **API Testing Tool** - Postman alternative with better collaboration
3. **Documentation Generator** - Auto-generate docs from code comments

## Personal Projects
- Build a mechanical keyboard configurator
- Create a plant care tracking app
- Develop a habit tracker with streaks

## Learning Goals
- [ ] Master Rust
- [ ] Learn WebAssembly
- [ ] Build something with WebRTC
- [ ] Contribute to open source`,
    description: 'Brain dump of project ideas',
    isFavorite: true,
    isPinned: true,
    language: 'markdown',
    userId: 'user_1',
    itemTypeId: 'type_note',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-03-12'),
  },
  {
    id: 'item_note_2',
    title: 'Meeting Notes: Sprint Planning',
    contentType: 'TEXT',
    content: `# Sprint 12 Planning - March 17, 2026

## Attendees
- Sarah (PM)
- Mike (Lead Dev)
- Alex (Frontend)
- Jordan (Backend)

## Goals
- Complete user authentication refactor
- Implement new dashboard widgets
- Fix critical bugs from last sprint

## Action Items
- [ ] Alex: Update component library to v3
- [ ] Jordan: Set up new staging environment
- [ ] Mike: Review PR backlog by EOD
- [ ] Sarah: Schedule user testing session

## Blockers
- Waiting for design approval on new login flow
- API rate limits need discussion`,
    description: 'Notes from sprint planning meeting',
    isFavorite: false,
    isPinned: false,
    language: 'markdown',
    userId: 'user_1',
    itemTypeId: 'type_note',
    createdAt: new Date('2026-03-17'),
    updatedAt: new Date('2026-03-17'),
  },
  {
    id: 'item_note_3',
    title: 'Book Notes: Clean Code',
    contentType: 'TEXT',
    content: `# Clean Code by Robert C. Martin

## Key Takeaways

### Naming
- Use intention-revealing names
- Avoid disinformation
- Make meaningful distinctions
- Use pronounceable names

### Functions
- Should be small (20 lines max ideally)
- Do one thing
- Use descriptive names
- Prefer fewer arguments

### Comments
- Comments lie! Code doesn't
- Explain yourself in code
- Good code is self-documenting
- Comments are for "why", not "what"

## Quotes
"Clean code is simple and direct."`,
    description: 'Notes from reading Clean Code',
    isFavorite: true,
    isPinned: false,
    language: 'markdown',
    userId: 'user_1',
    itemTypeId: 'type_note',
    createdAt: new Date('2026-02-08'),
    updatedAt: new Date('2026-02-20'),
  },
  {
    id: 'item_note_4',
    title: 'Conference Talk Ideas',
    contentType: 'TEXT',
    content: `# Potential Conference Talks

## 1. "From Zero to Production"
Journey of shipping a side project
- Finding the idea
- Tech stack decisions
- Launch strategies
- Lessons learned

## 2. "The Art of Code Review"
- Setting up a review culture
- What to look for
- Giving constructive feedback
- Handling disagreements

## 3. "TypeScript at Scale"
- Type safety patterns
- Generic tricks
- Type-driven development
- Migration strategies

Target conferences:
- React Conf
- TSConf
- Local meetups`,
    description: 'Ideas for tech talks',
    isFavorite: false,
    isPinned: false,
    language: 'markdown',
    userId: 'user_1',
    itemTypeId: 'type_note',
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-03-05'),
  },
  {
    id: 'item_note_5',
    title: 'Weekly Goals - Week 11',
    contentType: 'TEXT',
    content: `# Week of March 10-14, 2026

## Work
- [x] Complete API integration for new feature
- [x] Fix pagination bug in user list
- [ ] Write documentation for auth flow
- [ ] Review junior dev PRs

## Learning
- [ ] Watch Rust tutorial videos (2 hours)
- [ ] Read 2 chapters of System Design book
- [ ] Practice LeetCode (3 problems)

## Personal
- [ ] Gym 3 times
- [ ] Meal prep Sunday
- [ ] Call parents

## Reflection
Good week overall. Need to focus more on documentation next week.`,
    description: 'Weekly goals and tasks',
    isFavorite: false,
    isPinned: false,
    language: 'markdown',
    userId: 'user_1',
    itemTypeId: 'type_note',
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-03-14'),
  },
];

// Mock Items - Links (Green)
const linkItems: Item[] = [
  {
    id: 'item_link_1',
    title: 'React Documentation',
    contentType: 'TEXT',
    url: 'https://react.dev',
    content: 'https://react.dev',
    description: 'Official React documentation - the new docs are excellent',
    isFavorite: true,
    isPinned: true,
    userId: 'user_1',
    itemTypeId: 'type_link',
    createdAt: new Date('2026-01-03'),
    updatedAt: new Date('2026-03-08'),
  },
  {
    id: 'item_link_2',
    title: 'Tailwind CSS Cheat Sheet',
    contentType: 'TEXT',
    url: 'https://nerdcave.com/tailwind-cheat-sheet',
    content: 'https://nerdcave.com/tailwind-cheat-sheet',
    description: 'Quick reference for Tailwind classes',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_link',
    createdAt: new Date('2026-01-07'),
    updatedAt: new Date('2026-02-25'),
  },
  {
    id: 'item_link_3',
    title: 'MDN Web Docs',
    contentType: 'TEXT',
    url: 'https://developer.mozilla.org',
    content: 'https://developer.mozilla.org',
    description: 'The bible of web development',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_link',
    createdAt: new Date('2026-01-11'),
    updatedAt: new Date('2026-01-11'),
  },
  {
    id: 'item_link_4',
    title: 'System Design Primer',
    contentType: 'TEXT',
    url: 'https://github.com/donnemartin/system-design-primer',
    content: 'https://github.com/donnemartin/system-design-primer',
    description: 'Learn how to design large-scale systems',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_link',
    createdAt: new Date('2026-01-16'),
    updatedAt: new Date('2026-02-12'),
  },
  {
    id: 'item_link_5',
    title: 'TypeScript Handbook',
    contentType: 'TEXT',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    content: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    description: 'Official TypeScript documentation',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_link',
    createdAt: new Date('2026-01-21'),
    updatedAt: new Date('2026-01-21'),
  },
  {
    id: 'item_link_6',
    title: 'CSS-Tricks',
    contentType: 'TEXT',
    url: 'https://css-tricks.com',
    content: 'https://css-tricks.com',
    description: 'Daily articles about CSS and web design',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_link',
    createdAt: new Date('2026-01-26'),
    updatedAt: new Date('2026-03-02'),
  },
  {
    id: 'item_link_7',
    title: 'Roadmap.sh',
    contentType: 'TEXT',
    url: 'https://roadmap.sh',
    content: 'https://roadmap.sh',
    description: 'Developer roadmaps for different paths',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_link',
    createdAt: new Date('2026-01-31'),
    updatedAt: new Date('2026-01-31'),
  },
];

// Mock Items - Files (Gray)
const fileItems: Item[] = [
  {
    id: 'item_file_1',
    title: 'Project Requirements.pdf',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/files/requirements.pdf',
    fileName: 'Project Requirements.pdf',
    fileSize: 2457600,
    description: 'Client requirements document for the new project',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_file',
    createdAt: new Date('2026-01-09'),
    updatedAt: new Date('2026-01-09'),
  },
  {
    id: 'item_file_2',
    title: 'API Documentation.pdf',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/files/api-docs.pdf',
    fileName: 'API Documentation.pdf',
    fileSize: 1536000,
    description: 'Third-party API documentation',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_file',
    createdAt: new Date('2026-01-13'),
    updatedAt: new Date('2026-02-18'),
  },
  {
    id: 'item_file_3',
    title: 'database-schema.sql',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/files/schema.sql',
    fileName: 'database-schema.sql',
    fileSize: 45056,
    description: 'PostgreSQL schema dump',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_file',
    createdAt: new Date('2026-01-17'),
    updatedAt: new Date('2026-03-11'),
  },
  {
    id: 'item_file_4',
    title: 'env.example',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/files/env.example',
    fileName: 'env.example',
    fileSize: 1024,
    description: 'Environment variables template',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_file',
    createdAt: new Date('2026-01-23'),
    updatedAt: new Date('2026-01-23'),
  },
  {
    id: 'item_file_5',
    title: 'docker-compose.yml',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/files/docker-compose.yml',
    fileName: 'docker-compose.yml',
    fileSize: 2048,
    description: 'Docker compose configuration for local development',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_file',
    createdAt: new Date('2026-01-27'),
    updatedAt: new Date('2026-02-22'),
  },
];

// Mock Items - Images (Pink)
const imageItems: Item[] = [
  {
    id: 'item_image_1',
    title: 'Architecture Diagram',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/images/architecture.png',
    fileName: 'architecture.png',
    fileSize: 512000,
    description: 'System architecture diagram for the new microservices setup',
    isFavorite: true,
    isPinned: true,
    userId: 'user_1',
    itemTypeId: 'type_image',
    createdAt: new Date('2026-01-06'),
    updatedAt: new Date('2026-03-09'),
  },
  {
    id: 'item_image_2',
    title: 'UI Mockup - Dashboard',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/images/dashboard-mockup.png',
    fileName: 'dashboard-mockup.png',
    fileSize: 1048576,
    description: 'Figma export of the dashboard design',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_image',
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    id: 'item_image_3',
    title: 'Error Screenshot',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/images/error-screenshot.png',
    fileName: 'error-screenshot.png',
    fileSize: 307200,
    description: 'Production error that needs investigation',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_image',
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-18'),
  },
  {
    id: 'item_image_4',
    title: 'Team Photo',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/images/team-photo.jpg',
    fileName: 'team-photo.jpg',
    fileSize: 2097152,
    description: 'Team offsite photo from the retreat',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_image',
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-01-25'),
  },
  {
    id: 'item_image_5',
    title: 'Code Review Meme',
    contentType: 'FILE',
    fileUrl: 'https://pub-r2.dev/images/code-meme.jpg',
    fileName: 'code-meme.jpg',
    fileSize: 153600,
    description: 'Relatable dev humor for the team chat',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    itemTypeId: 'type_image',
    createdAt: new Date('2026-02-02'),
    updatedAt: new Date('2026-02-02'),
  },
];

// Combine all items
export const mockItems: Item[] = [
  ...snippetItems,
  ...promptItems,
  ...commandItems,
  ...noteItems,
  ...linkItems,
  ...fileItems,
  ...imageItems,
];

// Helper functions
export function getItemsByType(typeId: string): Item[] {
  return mockItems.filter(item => item.itemTypeId === typeId);
}

export function getItemById(id: string): Item | undefined {
  return mockItems.find(item => item.id === id);
}

export function getFavoriteItems(): Item[] {
  return mockItems.filter(item => item.isFavorite);
}

export function getPinnedItems(): Item[] {
  return mockItems.filter(item => item.isPinned);
}

export function getItemsByTag(tagName: string): Item[] {
  return mockItems.filter(item =>
    item.tags?.some(tag => tag.name === tagName)
  );
}

export function searchItems(query: string): Item[] {
  const lowerQuery = query.toLowerCase();
  return mockItems.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description?.toLowerCase().includes(lowerQuery) ||
    item.content?.toLowerCase().includes(lowerQuery)
  );
}

// Stats
export const mockStats = {
  totalItems: mockItems.length,
  snippets: snippetItems.length,
  prompts: promptItems.length,
  commands: commandItems.length,
  notes: noteItems.length,
  links: linkItems.length,
  files: fileItems.length,
  images: imageItems.length,
  favorites: mockItems.filter(i => i.isFavorite).length,
  pinned: mockItems.filter(i => i.isPinned).length,
};

// Mock user
export const mockUser = {
  id: 'user_1',
  email: 'dev@example.com',
  name: 'Developer User',
  image: 'https://github.com/ghost.png',
  isPro: true,
  createdAt: new Date('2026-01-01'),
};
