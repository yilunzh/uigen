# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It uses Claude AI to generate React components based on natural language descriptions, with a virtual file system for in-memory code editing and real-time browser preview.

## Common Commands

### Setup
```bash
npm run setup                # Install deps, generate Prisma client, run migrations
```

### Development
```bash
npm run dev                  # Start Next.js dev server with Turbopack
npm run dev:daemon           # Start dev server in background, logs to logs.txt
```

### Testing
```bash
npm test                     # Run all Vitest tests
npm run test -- <path>       # Run specific test file
```

### Build & Lint
```bash
npm run build                # Build production Next.js app
npm run lint                 # Run ESLint
```

### Database
```bash
npx prisma generate          # Generate Prisma client (outputs to src/generated/prisma)
npx prisma migrate dev       # Create and apply new migration
npm run db:reset             # Reset database (WARNING: destroys all data)
npx prisma studio            # Open database GUI
```

## Architecture

### Virtual File System (VFS)

The core architecture uses an **in-memory virtual file system** rather than writing files to disk. This is critical to understand:

- **VirtualFileSystem class** (`src/lib/file-system.ts`): Manages all generated code in memory
  - Uses a tree structure with `FileNode` objects (files and directories)
  - Serializes to/from JSON for persistence in the database
  - Provides file operations: create, read, update, delete, rename
  - Supports path normalization and parent directory auto-creation

- **File System Context** (`src/lib/contexts/file-system-context.tsx`): React context wrapping the VFS
  - Provides hooks for components to access/modify the virtual file system
  - Syncs with database via the Project model

### AI Tool System

The app uses Vercel AI SDK tools to allow Claude to manipulate the VFS:

1. **str_replace_editor** (`src/lib/tools/str-replace.ts`): Text editor commands
   - `view`: Display file contents with line numbers
   - `create`: Create new files
   - `str_replace`: Replace exact string matches
   - `insert`: Insert text at specific line number

2. **file_manager** (`src/lib/tools/file-manager.ts`): File operations
   - `rename`: Rename or move files/directories
   - `delete`: Delete files/directories

These tools are bound to the VFS instance and passed to Claude in `/api/chat/route.ts`.

### Live Preview System

Generated code is previewed in real-time using a client-side compilation pipeline:

1. **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`):
   - Transforms JSX/TSX using Babel Standalone (browser-based)
   - Creates blob URLs for each transformed module
   - Builds an import map to resolve dependencies
   - Handles `@/` alias (maps to VFS root `/`)
   - Loads third-party packages from esm.sh CDN
   - Collects CSS files into inline styles
   - Tracks syntax errors per-file

2. **PreviewFrame** (`src/components/preview/PreviewFrame.tsx`):
   - Renders generated HTML in an iframe with sandboxing
   - Injects import map and Tailwind CSS CDN
   - Entry point is always `/App.jsx` (required for every project)
   - Error boundary displays runtime errors
   - Syntax errors shown inline before attempting render

### Data Flow

```
User Message → Chat API → Claude (with VFS tools) → VFS Updates → Context → Preview
                ↓
           Project DB (Prisma)
```

1. User sends message via ChatInterface
2. API route (`src/app/api/chat/route.ts`) initializes VFS from project data
3. Claude uses tools to modify VFS
4. VFS changes trigger React context updates
5. PreviewFrame transforms and renders updated code
6. On completion, VFS state and messages are persisted to database

### Authentication & Projects

- **Auth**: JWT-based session cookies (jose library), bcrypt password hashing
  - Session middleware in `src/middleware.ts`
  - Auth functions in `src/lib/auth.ts`
  - Anonymous users supported (no session required)

- **Projects**:
  - **Database schema**: Always reference `prisma/schema.prisma` to understand data structure
  - Stored in SQLite via Prisma
  - Prisma client generated to `src/generated/prisma` (not standard location)
  - Each project stores: messages (JSON), VFS data (JSON), userId (optional)
  - Anonymous user work tracked via `src/lib/anon-work-tracker.ts`

### Component Structure

- **Chat**: `src/components/chat/` - Message list, input, markdown rendering
- **Editor**: `src/components/editor/` - File tree, Monaco code editor
- **Preview**: `src/components/preview/` - Iframe-based live preview
- **UI**: `src/components/ui/` - shadcn/ui components (Radix UI + Tailwind)

Main layout (`src/app/main-content.tsx`) uses resizable panels:
- Left: Chat interface
- Right: Tabbed view (Preview | Code)
  - Code view has file tree + editor split

### Mock Provider

When `ANTHROPIC_API_KEY` is not set, a **MockLanguageModel** is used (`src/lib/provider.ts`):
- Returns static component code (Counter, Form, or Card)
- Simulates multi-step tool calls for demo purposes
- Limits to 4 steps to prevent repetition

## Important Conventions

- **Entry point**: Every project MUST have `/App.jsx` as the root component
- **Imports**: Use `@/` alias for local files (e.g., `import Counter from '@/components/Counter'`)
- **Styling**: Tailwind classes only (v4), Tailwind CDN injected in preview
- **No HTML files**: React components only, rendered via ReactDOM in preview
- **Test files**: Co-located in `__tests__` directories next to source files
- **Prisma output**: Custom location `src/generated/prisma` (defined in schema)
- **Comments**: Use sparingly - only comment complex code that isn't self-evident
- **Zod version**: MUST use Zod v3 (not v4) for compatibility with AI SDK and Anthropic SDK

## Key Files to Understand

- `src/lib/file-system.ts` - VFS implementation
- `src/lib/transform/jsx-transformer.ts` - Client-side JSX compilation
- `src/app/api/chat/route.ts` - AI chat endpoint with VFS tools
- `src/lib/prompts/generation.tsx` - System prompt for component generation
- `src/components/preview/PreviewFrame.tsx` - Live preview renderer
