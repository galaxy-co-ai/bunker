# Bunker

A unified dashboard that keeps all project files, plans, and context in one place and auto-injects that context into any AI model (local or cloud) so agents actually know what they're building.

---

## Quick Context

**Status:** Planning complete. Ready to build.  
**Current Task:** Check `planning/07-project-pulse.md`  
**Total Tasks:** 89 (see MTS)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (client), React Query (server) |
| Database | SQLite via better-sqlite3 + Drizzle ORM |
| AI | Vercel AI SDK (Ollama, Claude API, OpenAI API) |
| Validation | Zod |
| Forms | React Hook Form |

---

## Constraints

- **100% local** — no cloud dependency, no auth, no accounts
- **SQLite only** — no external database server
- **Desktop-first** — primary use case is dev workstation
- **Ollama required** — must integrate with local models

---

## Directory Structure

```
bunker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Main app routes
│   │   │   ├── projects/[id]/  # Project views
│   │   │   └── settings/       # Settings page
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Sidebar, MainContent, ContextPanel
│   │   ├── projects/           # Project CRUD components
│   │   ├── sprints/            # Sprint/task components
│   │   ├── chat/               # Chat interface components
│   │   ├── context/            # Context panel components
│   │   └── settings/           # Settings components
│   ├── lib/
│   │   ├── db/                 # Database (schema, connection)
│   │   ├── ai/                 # AI adapters + context builder
│   │   ├── crypto/             # Secrets encryption
│   │   └── files/              # File system utilities
│   ├── hooks/                  # React hooks
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types
├── planning/                   # All planning docs (this folder)
└── public/                     # Static assets
```

---

## Planning Docs

| Doc | Purpose |
|-----|---------|
| `01-project-brief.md` | Problem, vision, scope, constraints |
| `02-prd.md` | Features, user stories, acceptance criteria |
| `03-tad.md` | Architecture, schema, APIs, components |
| `04-agent-crew-spec.md` | AI agent roles and responsibilities |
| `05-mts.md` | **Master Task Sequence** — all 89 tasks |
| `06-audit-checklist.md` | Planning validation (passed 100%) |
| `07-project-pulse.md` | **Current state** — start here |
| `08-decision-log.md` | Track deviations from plan |
| `09-test-plan.md` | Test cases by feature |
| `10-ship-checklist.md` | Final gate before deploy |

---

## Key Rules

1. **Follow the MTS** — execute tasks in order, don't skip
2. **Update Project Pulse** — after every task completion
3. **Log decisions** — any deviation goes in Decision Log
4. **TypeScript strict** — zero errors, no `any` types
5. **Zod validation** — all inputs validated at runtime
6. **No TBDs in code** — if unclear, ask or check PRD
7. **Test as you go** — unit tests with each feature

---

## Code Conventions

```typescript
// File naming: kebab-case
// Components: PascalCase
// Hooks: use-kebab-case.ts
// Types: PascalCase, suffix with Props/State where appropriate

// Imports order:
// 1. React/Next
// 2. External libraries
// 3. Internal components
// 4. Internal utilities
// 5. Types

// Always use named exports for components
export function MyComponent() { ... }

// Always validate API inputs with Zod
const schema = z.object({ ... });
const data = schema.parse(body);
```

---

## Database Schema (Summary)

| Table | Purpose |
|-------|---------|
| projects | Project records |
| sprints | Time-boxed work periods |
| tasks | Items within sprints |
| documents | Planning docs per project |
| conversations | Chat sessions |
| messages | Chat messages |
| secrets | Encrypted API keys/env vars |
| settings | App configuration |

Full schema in `03-tad.md` → Data Design section.

---

## API Routes (Summary)

| Route | Methods |
|-------|---------|
| `/api/projects` | GET, POST |
| `/api/projects/[id]` | GET, PATCH, DELETE |
| `/api/projects/[id]/sprints` | GET, POST |
| `/api/projects/[id]/documents` | GET, POST |
| `/api/projects/[id]/files` | GET |
| `/api/projects/[id]/secrets` | GET, POST |
| `/api/projects/[id]/conversations` | GET, POST |
| `/api/sprints/[id]` | GET, PATCH, DELETE |
| `/api/sprints/[id]/complete` | PATCH |
| `/api/sprints/[id]/tasks` | GET, POST |
| `/api/tasks/[id]` | PATCH, DELETE |
| `/api/documents/[id]` | GET, PATCH, DELETE |
| `/api/conversations/[id]/messages` | GET |
| `/api/chat` | POST (streaming) |
| `/api/models` | GET |
| `/api/settings` | GET, PATCH |

Full specs in `03-tad.md` → API Design section.

---

## Getting Started (For New Session)

1. Read `planning/07-project-pulse.md` — know current task
2. Read the current task in `planning/05-mts.md`
3. Check `planning/08-decision-log.md` for any deviations
4. Execute the task per its acceptance criteria
5. Update Project Pulse when done
6. Move to next task

---

## Sprint Map

| Sprint | Tasks | Focus |
|--------|-------|-------|
| 1 | 1-25 | Foundation (setup + database) |
| 2 | 26-45 | Core UX (layout + projects) |
| 3 | 46-65 | Content (sprints + context) |
| 4 | 66-80 | Intelligence (AI chat) |
| 5 | 81-89 | Ship (settings + polish) |

---

**End of claude.md**
