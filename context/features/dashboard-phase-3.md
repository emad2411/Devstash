Create the main dashboard content area for DevStash with three distinct sections.

SECTION 1 - Welcome Header:
- Large heading "Good morning, John" (use gradient text from white to gray-400)
- Subtext "You have 142 items stored in your stash." in muted-foreground

SECTION 2 - Pinned Collections Grid:
- Header "Pinned Collections" with "View all" link on right
- 2x3 grid of collection cards (responsive: 1 col mobile, 2 tablet, 3-4 desktop)
- Each card features:
  - Top: Row of 3-4 small icons representing content types (code, terminal, document, image, link) with colored backgrounds (blue, green, purple, orange, pink, yellow gradients)
  - Title (e.g., "React Patterns", "Docker Configs")
  - Item count ("12 items")
  - Left border accent matching the collection's primary color (4px colored border-left)
  - Hover: subtle lift and glow effect
  - Dark card background with border

SECTION 3 - Recent Items:
- Header "Recent Items" with view toggle buttons (grid/list icons) on right
- Grid of item cards featuring:
  - Header row: Type icon (colored by type), Title, Pin icon (outlined or filled yellow if pinned), Star icon (yellow if favorited)
  - Meta: Type label (Snippet, Prompt, Command, Note, Link, Image) • Relative time (2 hours ago, 1 day ago, etc.)
  - Description: 2-line truncated text describing the content
  - Tags: Rounded pill tags with # prefix (e.g., #react, #hooks, #ai, #bash)
  - Left border colored by item type (blue=snippet, purple=prompt, orange=command, yellow=note, green=link, pink=image)
  
Data structure:
- Create mock data arrays for collections and items
- Implement grid/list view toggle state
- Add hover interactions and click handlers

Layout:
- Max-width container with proper padding
- Gap-6 between cards
- Responsive grid system