# Master Task Sequence: Bunker

**Version:** 1.0  
**Created:** January 25, 2026  
**Author:** GalaxyCo.ai  
**Status:** Draft

---

## Overview

**Total Tasks:** 89  
**Phases:** 
- Setup (1-15)
- Database Layer (16-25)
- Core Layout (26-35)
- Project Management (36-45)
- Sprint Management (46-55)
- Context Panel (56-65)
- AI Chat (66-80)
- Settings & Polish (81-89)

---

## Phase 1: Project Setup (Tasks 1-15)

### Task 1: Create project directory
**Action:** Create `/bunker` project directory with standard structure
**Acceptance:** Directories exist: `/bunker/src`, `/bunker/public`
**Depends on:** None

### Task 2: Initialize package.json
**Action:** Run `npm init` with project metadata
**Acceptance:** `package.json` exists with name "bunker", version "0.1.0"
**Depends on:** Task 1

### Task 3: Install Next.js 15 and React 19
**Action:** Install next@15, react@19, react-dom@19
**Acceptance:** Dependencies in package.json, node_modules created
**Depends on:** Task 2

### Task 4: Install TypeScript and configure
**Action:** Install typescript, @types/react, @types/node; create tsconfig.json
**Acceptance:** `tsconfig.json` exists with strict mode enabled
**Depends on:** Task 3

### Task 5: Install Tailwind CSS
**Action:** Install tailwindcss, postcss, autoprefixer; create configs
**Acceptance:** `tailwind.config.ts` and `postcss.config.js` exist
**Depends on:** Task 4

### Task 6: Initialize shadcn/ui
**Action:** Run `npx shadcn@latest init`
**Acceptance:** `components.json` exists, `/src/components/ui` created
**Depends on:** Task 5

### Task 7: Install core shadcn components
**Action:** Add button, input, card, dialog, dropdown-menu, tabs, toast, separator
**Acceptance:** Components exist in `/src/components/ui`
**Depends on:** Task 6

### Task 8: Install Lucide icons
**Action:** Install lucide-react
**Acceptance:** lucide-react in dependencies
**Depends on:** Task 3

### Task 9: Install Zustand
**Action:** Install zustand
**Acceptance:** zustand in dependencies
**Depends on:** Task 3

### Task 10: Install React Query
**Action:** Install @tanstack/react-query
**Acceptance:** @tanstack/react-query in dependencies
**Depends on:** Task 3

### Task 11: Install Zod
**Action:** Install zod
**Acceptance:** zod in dependencies
**Depends on:** Task 3

### Task 12: Install React Hook Form
**Action:** Install react-hook-form, @hookform/resolvers
**Acceptance:** Dependencies in package.json
**Depends on:** Task 11

### Task 13: Create Next.js app structure
**Action:** Create `/src/app/layout.tsx`, `/src/app/page.tsx`
**Acceptance:** App runs with `npm run dev`, shows default page
**Depends on:** Task 4

### Task 14: Add global styles
**Action:** Create `/src/app/globals.css` with Tailwind directives
**Acceptance:** Tailwind classes work in components
**Depends on:** Task 5, Task 13

### Task 15: Create lib/utils.ts
**Action:** Create utility file with `cn()` helper
**Acceptance:** `/src/lib/utils.ts` exists with cn function
**Depends on:** Task 4

---

## Phase 2: Database Layer (Tasks 16-25)

### Task 16: Install SQLite dependencies
**Action:** Install better-sqlite3, @types/better-sqlite3
**Acceptance:** Dependencies in package.json
**Depends on:** Task 3

### Task 17: Install Drizzle ORM
**Action:** Install drizzle-orm, drizzle-kit
**Acceptance:** Dependencies in package.json
**Depends on:** Task 16

### Task 18: Create Drizzle config
**Action:** Create `drizzle.config.ts` pointing to SQLite file
**Acceptance:** Config file exists with correct SQLite path
**Depends on:** Task 17

### Task 19: Define database schema - projects table
**Action:** Create `/src/lib/db/schema.ts` with projects table
**Acceptance:** Schema exports projects table with id, name, description, path, timestamps
**Depends on:** Task 17

### Task 20: Define database schema - sprints table
**Action:** Add sprints table to schema
**Acceptance:** Schema exports sprints table with FK to projects
**Depends on:** Task 19

### Task 21: Define database schema - tasks table
**Action:** Add tasks table to schema
**Acceptance:** Schema exports tasks table with FK to sprints
**Depends on:** Task 20

### Task 22: Define database schema - documents table
**Action:** Add documents table to schema
**Acceptance:** Schema exports documents table with FK to projects
**Depends on:** Task 19

### Task 23: Define database schema - conversations and messages tables
**Action:** Add conversations and messages tables to schema
**Acceptance:** Schema exports both tables with proper FKs
**Depends on:** Task 19

### Task 24: Define database schema - secrets and settings tables
**Action:** Add secrets and settings tables to schema
**Acceptance:** Schema exports both tables
**Depends on:** Task 19

### Task 25: Create database connection utility
**Action:** Create `/src/lib/db/index.ts` with connection and migration runner
**Acceptance:** DB initializes on first access, creates tables
**Depends on:** Task 24

---

## Phase 3: Core Layout (Tasks 26-35)

### Task 26: Create root layout with providers
**Action:** Update `/src/app/layout.tsx` with QueryClientProvider, theme
**Acceptance:** Providers wrap app, no hydration errors
**Depends on:** Task 10, Task 14

### Task 27: Create Zustand stores
**Action:** Create `/src/stores/project-store.ts` and `/src/stores/ui-store.ts`
**Acceptance:** Stores export activeProjectId, sidebarOpen, contextPanelOpen
**Depends on:** Task 9

### Task 28: Create Sidebar component
**Action:** Create `/src/components/layout/sidebar.tsx`
**Acceptance:** Sidebar renders with logo, project list placeholder, settings link
**Depends on:** Task 7, Task 8

### Task 29: Create MainContent component
**Action:** Create `/src/components/layout/main-content.tsx`
**Acceptance:** MainContent renders children with proper styling
**Depends on:** Task 7

### Task 30: Create ContextPanel component shell
**Action:** Create `/src/components/layout/context-panel.tsx`
**Acceptance:** ContextPanel renders collapsible with tabs placeholder
**Depends on:** Task 7

### Task 31: Create DashboardLayout component
**Action:** Create `/src/app/(dashboard)/layout.tsx` composing Sidebar, MainContent, ContextPanel
**Acceptance:** Three-panel layout renders correctly
**Depends on:** Task 28, Task 29, Task 30

### Task 32: Create dashboard home page
**Action:** Create `/src/app/(dashboard)/page.tsx` with redirect to projects
**Acceptance:** Route `/` redirects to `/projects`
**Depends on:** Task 31

### Task 33: Create empty state component
**Action:** Create `/src/components/ui/empty-state.tsx`
**Acceptance:** Reusable empty state with icon, title, description, action
**Depends on:** Task 7, Task 8

### Task 34: Create loading skeleton components
**Action:** Create `/src/components/ui/skeleton.tsx` variants
**Acceptance:** Skeleton components for cards, lists, text
**Depends on:** Task 7

### Task 35: Create toast notifications setup
**Action:** Configure shadcn toast, create useToast hook
**Acceptance:** Toasts can be triggered from anywhere in app
**Depends on:** Task 7

---

## Phase 4: Project Management (Tasks 36-45)

### Task 36: Create projects API route - GET (list)
**Action:** Create `/src/app/api/projects/route.ts` GET handler
**Acceptance:** GET /api/projects returns array of projects from DB
**Depends on:** Task 25

### Task 37: Create projects API route - POST (create)
**Action:** Add POST handler to projects route
**Acceptance:** POST /api/projects creates project, returns created project
**Depends on:** Task 36

### Task 38: Create single project API route - GET, PATCH, DELETE
**Action:** Create `/src/app/api/projects/[id]/route.ts`
**Acceptance:** CRUD operations work for single project
**Depends on:** Task 36

### Task 39: Create useProjects hook
**Action:** Create `/src/hooks/use-projects.ts` with React Query
**Acceptance:** Hook returns projects list, loading, error, mutations
**Depends on:** Task 36, Task 10

### Task 40: Create ProjectList component
**Action:** Create `/src/components/projects/project-list.tsx`
**Acceptance:** Lists projects, shows active indicator, click to select
**Depends on:** Task 39, Task 27

### Task 41: Create NewProjectDialog component
**Action:** Create `/src/components/projects/new-project-dialog.tsx`
**Acceptance:** Dialog opens, validates input, creates project on submit
**Depends on:** Task 39, Task 12

### Task 42: Create EditProjectDialog component
**Action:** Create `/src/components/projects/edit-project-dialog.tsx`
**Acceptance:** Dialog pre-fills values, updates project on submit
**Depends on:** Task 39, Task 12

### Task 43: Create DeleteProjectDialog component
**Action:** Create `/src/components/projects/delete-project-dialog.tsx`
**Acceptance:** Confirmation dialog, deletes on confirm
**Depends on:** Task 39

### Task 44: Integrate project list into Sidebar
**Action:** Update Sidebar to use ProjectList, NewProjectDialog
**Acceptance:** Projects appear in sidebar, can create new project
**Depends on:** Task 40, Task 41

### Task 45: Implement project switching
**Action:** Update project-store, update UI on project change
**Acceptance:** Clicking project updates activeProjectId, URL changes
**Depends on:** Task 27, Task 44

---

## Phase 5: Sprint Management (Tasks 46-55)

### Task 46: Create sprints API routes
**Action:** Create `/src/app/api/projects/[projectId]/sprints/route.ts`
**Acceptance:** GET lists sprints, POST creates sprint
**Depends on:** Task 25

### Task 47: Create single sprint API routes
**Action:** Create `/src/app/api/sprints/[id]/route.ts`
**Acceptance:** GET, PATCH, DELETE work for single sprint
**Depends on:** Task 46

### Task 48: Create sprint complete API route
**Action:** Create `/src/app/api/sprints/[id]/complete/route.ts`
**Acceptance:** PATCH marks sprint completed with timestamp
**Depends on:** Task 47

### Task 49: Create tasks API routes
**Action:** Create `/src/app/api/sprints/[sprintId]/tasks/route.ts`
**Acceptance:** GET lists tasks, POST creates task
**Depends on:** Task 25

### Task 50: Create single task API routes
**Action:** Create `/src/app/api/tasks/[id]/route.ts`
**Acceptance:** PATCH updates task (status, title), DELETE removes task
**Depends on:** Task 49

### Task 51: Create useSprints hook
**Action:** Create `/src/hooks/use-sprints.ts`
**Acceptance:** Hook returns sprints for project, mutations
**Depends on:** Task 46, Task 10

### Task 52: Create useTasks hook
**Action:** Create `/src/hooks/use-tasks.ts`
**Acceptance:** Hook returns tasks for sprint, mutations
**Depends on:** Task 49, Task 10

### Task 53: Create SprintList component
**Action:** Create `/src/components/sprints/sprint-list.tsx`
**Acceptance:** Lists sprints, shows current sprint indicator
**Depends on:** Task 51

### Task 54: Create SprintDetail component
**Action:** Create `/src/components/sprints/sprint-detail.tsx`
**Acceptance:** Shows tasks, progress bar, complete button
**Depends on:** Task 52, Task 53

### Task 55: Create sprints page
**Action:** Create `/src/app/(dashboard)/projects/[id]/sprints/page.tsx`
**Acceptance:** Route shows sprint list and detail view
**Depends on:** Task 53, Task 54

---

## Phase 6: Roadmap & Context Panel (Tasks 56-65)

### Task 56: Create RoadmapView component
**Action:** Create `/src/components/roadmap/roadmap-view.tsx`
**Acceptance:** Shows project milestones/sprints as timeline or list
**Depends on:** Task 51

### Task 57: Create roadmap page (project home)
**Action:** Create `/src/app/(dashboard)/projects/[id]/page.tsx`
**Acceptance:** Route shows roadmap view with progress
**Depends on:** Task 56

### Task 58: Create documents API routes
**Action:** Create `/src/app/api/projects/[projectId]/documents/route.ts`
**Acceptance:** GET lists docs, POST creates doc
**Depends on:** Task 25

### Task 59: Create single document API routes
**Action:** Create `/src/app/api/documents/[id]/route.ts`
**Acceptance:** GET returns content, PATCH updates, DELETE removes
**Depends on:** Task 58

### Task 60: Create useDocuments hook
**Action:** Create `/src/hooks/use-documents.ts`
**Acceptance:** Hook returns documents for project, mutations
**Depends on:** Task 58, Task 10

### Task 61: Create DocList component
**Action:** Create `/src/components/context/doc-list.tsx`
**Acceptance:** Lists documents, click to view
**Depends on:** Task 60

### Task 62: Create DocViewer component
**Action:** Create `/src/components/context/doc-viewer.tsx`
**Acceptance:** Renders markdown content, syntax highlighting
**Depends on:** Task 60

### Task 63: Create files API routes
**Action:** Create `/src/app/api/projects/[projectId]/files/route.ts`
**Acceptance:** GET returns file tree for project path
**Depends on:** Task 25

### Task 64: Create FileTree component
**Action:** Create `/src/components/context/file-tree.tsx`
**Acceptance:** Renders expandable file tree, ignores common patterns
**Depends on:** Task 63

### Task 65: Complete ContextPanel with tabs
**Action:** Update ContextPanel with Docs, Files, Sprint tabs
**Acceptance:** Tabs switch between DocList, FileTree, SprintSummary
**Depends on:** Task 61, Task 64, Task 54

---

## Phase 7: AI Chat (Tasks 66-80)

### Task 66: Install Vercel AI SDK
**Action:** Install ai, @ai-sdk/openai, @ai-sdk/anthropic
**Acceptance:** Dependencies in package.json
**Depends on:** Task 3

### Task 67: Create conversations API routes
**Action:** Create `/src/app/api/projects/[projectId]/conversations/route.ts`
**Acceptance:** GET lists conversations, POST creates conversation
**Depends on:** Task 25

### Task 68: Create messages API route
**Action:** Create `/src/app/api/conversations/[id]/messages/route.ts`
**Acceptance:** GET returns messages for conversation
**Depends on:** Task 67

### Task 69: Create Ollama adapter
**Action:** Create `/src/lib/ai/ollama.ts`
**Acceptance:** Adapter connects to Ollama, lists models, sends messages
**Depends on:** Task 66

### Task 70: Create Claude adapter
**Action:** Create `/src/lib/ai/claude.ts`
**Acceptance:** Adapter uses Anthropic SDK, streams responses
**Depends on:** Task 66

### Task 71: Create OpenAI adapter
**Action:** Create `/src/lib/ai/openai.ts`
**Acceptance:** Adapter uses OpenAI SDK, streams responses
**Depends on:** Task 66

### Task 72: Create chat API route
**Action:** Create `/src/app/api/chat/route.ts` with streaming
**Acceptance:** POST accepts message, returns SSE stream
**Depends on:** Task 69, Task 70, Task 71

### Task 73: Create models API route
**Action:** Create `/src/app/api/models/route.ts`
**Acceptance:** GET returns available models from all configured providers
**Depends on:** Task 69, Task 70, Task 71

### Task 74: Create context builder
**Action:** Create `/src/lib/ai/context-builder.ts`
**Acceptance:** Builds context string from project, sprint, docs
**Depends on:** Task 60, Task 51

### Task 75: Create useChat hook
**Action:** Create `/src/hooks/use-chat.ts`
**Acceptance:** Hook handles message sending, streaming, history
**Depends on:** Task 72, Task 10

### Task 76: Create ChatMessages component
**Action:** Create `/src/components/chat/chat-messages.tsx`
**Acceptance:** Renders message history with user/assistant styling
**Depends on:** Task 75

### Task 77: Create ChatInput component
**Action:** Create `/src/components/chat/chat-input.tsx`
**Acceptance:** Text input, send button, handles submit
**Depends on:** Task 75

### Task 78: Create ModelSelector component
**Action:** Create `/src/components/chat/model-selector.tsx`
**Acceptance:** Dropdown shows available models, selection persists
**Depends on:** Task 73

### Task 79: Create ChatInterface component
**Action:** Create `/src/components/chat/chat-interface.tsx`
**Acceptance:** Composes messages, input, model selector
**Depends on:** Task 76, Task 77, Task 78

### Task 80: Create chat page
**Action:** Create `/src/app/(dashboard)/projects/[id]/chat/page.tsx`
**Acceptance:** Route shows chat interface, context injected
**Depends on:** Task 79, Task 74

---

## Phase 8: Settings & Ship (Tasks 81-89)

### Task 81: Create secrets encryption utility
**Action:** Create `/src/lib/crypto/secrets.ts`
**Acceptance:** encrypt() and decrypt() functions work with AES-256-GCM
**Depends on:** Task 4

### Task 82: Create secrets API routes
**Action:** Create `/src/app/api/projects/[projectId]/secrets/route.ts`
**Acceptance:** GET lists keys (not values), POST creates/updates encrypted
**Depends on:** Task 81, Task 25

### Task 83: Create settings API routes
**Action:** Create `/src/app/api/settings/route.ts`
**Acceptance:** GET returns settings, PATCH updates settings
**Depends on:** Task 25

### Task 84: Create useSettings hook
**Action:** Create `/src/hooks/use-settings.ts`
**Acceptance:** Hook returns settings, update mutation
**Depends on:** Task 83, Task 10

### Task 85: Create SettingsPage component
**Action:** Create `/src/components/settings/settings-page.tsx`
**Acceptance:** Forms for general, models, appearance settings
**Depends on:** Task 84, Task 12

### Task 86: Create settings page route
**Action:** Create `/src/app/(dashboard)/settings/page.tsx`
**Acceptance:** Route shows settings page
**Depends on:** Task 85

### Task 87: Add keyboard shortcuts
**Action:** Add global keyboard handler for common actions
**Acceptance:** Cmd+K opens search, Cmd+N new project, etc.
**Depends on:** Task 45

### Task 88: Final polish and bug fixes
**Action:** Review all features, fix visual bugs, improve UX
**Acceptance:** All PRD acceptance criteria pass, no console errors
**Depends on:** Task 86

### Task 89: Project complete - Ship Checklist
**Action:** Run Ship Checklist, deploy/package for distribution
**Acceptance:** Ship Checklist passes 100%
**Depends on:** Task 88

---

## Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-15 | Project Setup |
| 2 | 16-25 | Database Layer |
| 3 | 26-35 | Core Layout |
| 4 | 36-45 | Project Management |
| 5 | 46-55 | Sprint Management |
| 6 | 56-65 | Roadmap & Context Panel |
| 7 | 66-80 | AI Chat |
| 8 | 81-89 | Settings & Ship |

**Total:** 89 tasks

---

## Sprint Mapping (Optional)

For sprint planning, tasks can be grouped:

| Sprint | Tasks | Focus |
|--------|-------|-------|
| Sprint 1 | 1-25 | Foundation (setup + database) |
| Sprint 2 | 26-45 | Core UX (layout + projects) |
| Sprint 3 | 46-65 | Content (sprints + context) |
| Sprint 4 | 66-80 | Intelligence (AI chat) |
| Sprint 5 | 81-89 | Ship (settings + polish) |

---

**End of Master Task Sequence**
