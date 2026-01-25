# Technical Architecture Document: Bunker

**Version:** 1.0  
**Created:** January 25, 2026  
**Author:** GalaxyCo.ai  
**Status:** Draft

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BUNKER                                  │
│                   (Next.js 15 App Router)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (React 19)                   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────┐    │   │
│  │  │ Sidebar  │  │  Main View   │  │ Context Panel  │    │   │
│  │  │          │  │              │  │                │    │   │
│  │  │ Projects │  │ • Roadmap    │  │ • Docs         │    │   │
│  │  │ Settings │  │ • Sprints    │  │ • Files        │    │   │
│  │  │          │  │ • Chat       │  │ • Sprint       │    │   │
│  │  └──────────┘  └──────────────┘  └────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  API ROUTES (Local)                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  /api/projects  /api/sprints  /api/chat  /api/files     │   │
│  │  /api/tasks     /api/docs     /api/models /api/secrets  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   DATA LAYER                             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   SQLite    │  │   File      │  │   Crypto    │     │   │
│  │  │   (DB)      │  │   System    │  │   (Secrets) │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Ollama    │  │  Claude API │  │  OpenAI API │             │
│  │   (Local)   │  │   (Cloud)   │  │   (Cloud)   │             │
│  │  :11434     │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### System Description

Bunker is a local-first Next.js application that runs entirely on the user's machine. There is no remote backend — all data is stored in a local SQLite database, and all API routes execute locally within the Next.js process.

The application follows a three-panel layout: a sidebar for navigation and project switching, a main content area for the primary view (roadmap, sprints, or chat), and a collapsible context panel showing project documentation, file tree, and current sprint state.

AI model integrations are handled through provider-specific adapters. Ollama connects to a local instance (default localhost:11434). Claude and OpenAI connect to their respective cloud APIs using user-provided API keys stored encrypted locally.

### Key Architectural Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| Database | PostgreSQL, SQLite, IndexedDB | SQLite | Portable, no server, proven for local apps |
| Framework | Electron + React, Tauri + React, Next.js standalone | Next.js 15 | Team expertise, fast iteration, can wrap later if needed |
| State Management | Redux, Zustand, Jotai | Zustand | Simple, minimal boilerplate, good for medium apps |
| Data Fetching | SWR, React Query, custom | React Query | Caching, background refresh, mutation handling |
| UI Library | Custom, MUI, shadcn/ui | shadcn/ui | Unstyled, customizable, good accessibility |
| AI SDK | Custom, Vercel AI SDK | Vercel AI SDK | Streaming support, multi-provider, maintained |

---

## Tech Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Framework | Next.js | 15.x | App Router, Server Components, API Routes |
| Language | TypeScript | 5.x | Type safety, team standard |
| Runtime | Node.js | 20.x | LTS, required for Next.js |
| React | React | 19.x | Latest, required by Next.js 15 |
| CSS | Tailwind CSS | 3.x | Utility-first, fast iteration |
| UI Components | shadcn/ui | Latest | Accessible, unstyled, customizable |
| Icons | Lucide React | Latest | Consistent icon set |
| State (Client) | Zustand | 4.x | Simple, minimal boilerplate |
| Data Fetching | React Query | 5.x | Caching, mutations, background sync |
| Database | SQLite | 3.x | Local, portable, no server |
| DB Library | better-sqlite3 | 11.x | Synchronous, fast, well-maintained |
| ORM | Drizzle ORM | Latest | Type-safe, lightweight, SQLite support |
| AI SDK | Vercel AI SDK | 3.x | Streaming, multi-provider |
| Encryption | crypto (Node.js) | Built-in | Secrets encryption |
| Validation | Zod | 3.x | Runtime validation, TypeScript inference |
| Form Handling | React Hook Form | 7.x | Performance, validation integration |

---

## Component Design

### Component: AppLayout
**Responsibility:** Root layout structure with three-panel design.

**Interfaces:**
- Input: Active project ID, current view
- Output: Rendered layout with sidebar, main, context panel

**Internal Structure:**
- Sidebar (fixed width, collapsible on mobile)
- Main content area (flexible width)
- Context panel (fixed width, collapsible)
- Global state providers (QueryClient, Zustand store)

---

### Component: Sidebar
**Responsibility:** Navigation and project switching.

**Interfaces:**
- Input: Project list, active project ID
- Output: Navigation events, project selection

**Dependencies:**
- ProjectStore (Zustand)
- React Query for project list

**Internal Structure:**
- Logo/brand
- Project list with active indicator
- "New Project" button
- Settings link
- Collapse toggle

---

### Component: ProjectManager
**Responsibility:** CRUD operations for projects.

**Interfaces:**
- Input: User actions (create, edit, delete)
- Output: Database mutations, UI updates

**Dependencies:**
- Database layer
- React Query mutations

---

### Component: MainView
**Responsibility:** Render current view based on route.

**Interfaces:**
- Input: Current route, active project
- Output: Roadmap, Sprint, or Chat view

**Internal Structure:**
- View tabs/navigation
- View-specific content
- View-specific actions

---

### Component: RoadmapView
**Responsibility:** Display project progress and milestones.

**Interfaces:**
- Input: Project milestones, progress data
- Output: Visual timeline/kanban

**Dependencies:**
- Sprint data for progress calculation

---

### Component: SprintManager
**Responsibility:** Sprint and task management.

**Interfaces:**
- Input: Project ID
- Output: Sprint list, task CRUD, sprint state changes

**Internal Structure:**
- Sprint list
- Sprint detail (tasks)
- Task item (checkbox, title, actions)

---

### Component: ChatInterface
**Responsibility:** AI conversation interface.

**Interfaces:**
- Input: User messages
- Output: AI responses (streamed), message history

**Dependencies:**
- Model adapters (Ollama, Claude, OpenAI)
- Context builder

**Internal Structure:**
- Message list
- Input area
- Model selector
- Context toggle

---

### Component: ContextPanel
**Responsibility:** Display project context for reference and injection.

**Interfaces:**
- Input: Active project ID
- Output: Context for AI injection, reference display

**Internal Structure:**
- Tab navigation (Docs, Files, Sprint)
- Document viewer
- File tree browser
- Sprint summary

---

### Component: ModelAdapter (Abstract)
**Responsibility:** Unified interface for AI model providers.

**Interfaces:**
- Input: Messages, model config
- Output: Streamed response

**Implementations:**
- OllamaAdapter
- ClaudeAdapter
- OpenAIAdapter

---

### Component: ContextBuilder
**Responsibility:** Assemble project context for AI injection.

**Interfaces:**
- Input: Project ID, context settings
- Output: Formatted context string

**Dependencies:**
- Project data
- Sprint data
- Document data

**Internal Structure:**
- Gather relevant data
- Format as system prompt
- Truncate if needed
- Return formatted context

---

### Component: SecretsManager
**Responsibility:** Encrypted storage for sensitive data.

**Interfaces:**
- Input: Key-value pairs
- Output: Encrypted storage, decrypted retrieval

**Dependencies:**
- Node.js crypto module
- Database layer

---

### Component: SettingsPage
**Responsibility:** App configuration UI.

**Interfaces:**
- Input: User configuration changes
- Output: Persisted settings

**Internal Structure:**
- General settings form
- Model connection forms
- Appearance settings
- Reset/export options

---

## Data Design

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  projects   │───┬───│   sprints   │───────│    tasks    │
└─────────────┘   │   └─────────────┘       └─────────────┘
                  │
                  ├───│  documents  │
                  │   └─────────────┘
                  │
                  ├───│  secrets    │
                  │   └─────────────┘
                  │
                  └───│conversations│───────│  messages   │
                      └─────────────┘       └─────────────┘

┌─────────────┐
│  settings   │  (singleton, app-wide)
└─────────────┘
```

### Schema Definition

#### Table: projects
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | UUID primary identifier |
| name | TEXT | NOT NULL | Project name |
| description | TEXT | | Optional description |
| path | TEXT | | Local filesystem path |
| created_at | INTEGER | NOT NULL | Unix timestamp |
| updated_at | INTEGER | NOT NULL | Unix timestamp |
| settings | TEXT | | JSON blob for project-specific settings |

#### Table: sprints
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | UUID primary identifier |
| project_id | TEXT | FK, NOT NULL | Reference to projects |
| name | TEXT | NOT NULL | Sprint name |
| start_date | INTEGER | | Unix timestamp |
| end_date | INTEGER | | Unix timestamp |
| status | TEXT | NOT NULL | 'planned', 'active', 'completed' |
| created_at | INTEGER | NOT NULL | Unix timestamp |
| completed_at | INTEGER | | Unix timestamp when completed |

#### Table: tasks
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | UUID primary identifier |
| sprint_id | TEXT | FK, NOT NULL | Reference to sprints |
| title | TEXT | NOT NULL | Task title |
| description | TEXT | | Optional description |
| status | TEXT | NOT NULL | 'todo', 'in_progress', 'done' |
| order_index | INTEGER | NOT NULL | Sort order within sprint |
| created_at | INTEGER | NOT NULL | Unix timestamp |
| completed_at | INTEGER | | Unix timestamp when completed |

#### Table: documents
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | UUID primary identifier |
| project_id | TEXT | FK, NOT NULL | Reference to projects |
| name | TEXT | NOT NULL | Document name |
| content | TEXT | NOT NULL | Document content (markdown) |
| doc_type | TEXT | | 'brief', 'prd', 'tad', 'other' |
| created_at | INTEGER | NOT NULL | Unix timestamp |
| updated_at | INTEGER | NOT NULL | Unix timestamp |

#### Table: conversations
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | UUID primary identifier |
| project_id | TEXT | FK, NOT NULL | Reference to projects |
| title | TEXT | | Optional conversation title |
| model_id | TEXT | | Model used for this conversation |
| created_at | INTEGER | NOT NULL | Unix timestamp |
| updated_at | INTEGER | NOT NULL | Unix timestamp |

#### Table: messages
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | UUID primary identifier |
| conversation_id | TEXT | FK, NOT NULL | Reference to conversations |
| role | TEXT | NOT NULL | 'user', 'assistant', 'system' |
| content | TEXT | NOT NULL | Message content |
| created_at | INTEGER | NOT NULL | Unix timestamp |

#### Table: secrets
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | UUID primary identifier |
| project_id | TEXT | FK, NOT NULL | Reference to projects |
| key | TEXT | NOT NULL | Secret name/key |
| encrypted_value | TEXT | NOT NULL | Encrypted secret value |
| created_at | INTEGER | NOT NULL | Unix timestamp |
| updated_at | INTEGER | NOT NULL | Unix timestamp |

#### Table: settings
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | TEXT | PK | Setting key |
| value | TEXT | NOT NULL | JSON-encoded value |
| updated_at | INTEGER | NOT NULL | Unix timestamp |

---

## API Design

All API routes are local Next.js API routes. No external server.

### Projects API

#### GET /api/projects
**Purpose:** List all projects.

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string|null",
      "path": "string|null",
      "created_at": "number",
      "updated_at": "number"
    }
  ]
}
```

#### POST /api/projects
**Purpose:** Create a new project.

**Request:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "path": "string (optional)"
}
```

**Response (201):**
```json
{
  "project": { ... }
}
```

#### GET /api/projects/[id]
**Purpose:** Get a single project.

**Response (200):**
```json
{
  "project": { ... }
}
```

#### PATCH /api/projects/[id]
**Purpose:** Update a project.

**Request:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "path": "string (optional)"
}
```

#### DELETE /api/projects/[id]
**Purpose:** Delete a project and all related data.

**Response (204):** No content

---

### Sprints API

#### GET /api/projects/[projectId]/sprints
**Purpose:** List sprints for a project.

#### POST /api/projects/[projectId]/sprints
**Purpose:** Create a sprint.

**Request:**
```json
{
  "name": "string",
  "start_date": "number (optional)",
  "end_date": "number (optional)"
}
```

#### PATCH /api/sprints/[id]
**Purpose:** Update a sprint.

#### PATCH /api/sprints/[id]/complete
**Purpose:** Mark sprint as completed.

#### DELETE /api/sprints/[id]
**Purpose:** Delete a sprint.

---

### Tasks API

#### GET /api/sprints/[sprintId]/tasks
**Purpose:** List tasks for a sprint.

#### POST /api/sprints/[sprintId]/tasks
**Purpose:** Create a task.

**Request:**
```json
{
  "title": "string",
  "description": "string (optional)"
}
```

#### PATCH /api/tasks/[id]
**Purpose:** Update a task (including status changes).

#### PATCH /api/tasks/reorder
**Purpose:** Reorder tasks within a sprint.

**Request:**
```json
{
  "sprint_id": "string",
  "task_ids": ["id1", "id2", "id3"]
}
```

#### DELETE /api/tasks/[id]
**Purpose:** Delete a task.

---

### Documents API

#### GET /api/projects/[projectId]/documents
**Purpose:** List documents for a project.

#### POST /api/projects/[projectId]/documents
**Purpose:** Create a document.

**Request:**
```json
{
  "name": "string",
  "content": "string",
  "doc_type": "string (optional)"
}
```

#### GET /api/documents/[id]
**Purpose:** Get document content.

#### PATCH /api/documents/[id]
**Purpose:** Update a document.

#### DELETE /api/documents/[id]
**Purpose:** Delete a document.

---

### Chat API

#### GET /api/projects/[projectId]/conversations
**Purpose:** List conversations for a project.

#### POST /api/projects/[projectId]/conversations
**Purpose:** Create a new conversation.

#### GET /api/conversations/[id]/messages
**Purpose:** Get messages for a conversation.

#### POST /api/chat
**Purpose:** Send a message and get AI response.

**Request:**
```json
{
  "conversation_id": "string",
  "message": "string",
  "model": "string",
  "include_context": "boolean"
}
```

**Response:** Server-Sent Events stream of AI response.

---

### Models API

#### GET /api/models
**Purpose:** List available models across all providers.

**Response (200):**
```json
{
  "models": [
    {
      "id": "string",
      "name": "string",
      "provider": "ollama|claude|openai",
      "available": "boolean"
    }
  ]
}
```

#### POST /api/models/test
**Purpose:** Test connection to a model provider.

**Request:**
```json
{
  "provider": "ollama|claude|openai",
  "config": { ... }
}
```

---

### Files API

#### GET /api/projects/[projectId]/files
**Purpose:** Get file tree for a project.

**Response (200):**
```json
{
  "tree": {
    "name": "root",
    "type": "directory",
    "children": [ ... ]
  }
}
```

#### GET /api/files/content
**Purpose:** Get file content (read-only).

**Query:** `?path=/absolute/path/to/file`

**Response (200):**
```json
{
  "content": "string",
  "path": "string",
  "size": "number"
}
```

---

### Secrets API

#### GET /api/projects/[projectId]/secrets
**Purpose:** List secrets (keys only, not values).

#### POST /api/projects/[projectId]/secrets
**Purpose:** Create or update a secret.

**Request:**
```json
{
  "key": "string",
  "value": "string"
}
```

#### DELETE /api/secrets/[id]
**Purpose:** Delete a secret.

---

### Settings API

#### GET /api/settings
**Purpose:** Get all settings.

#### PATCH /api/settings
**Purpose:** Update settings.

**Request:**
```json
{
  "key": "value",
  "another_key": "value"
}
```

---

## Security Model

### Authentication
Not applicable — single-user local app, no auth required.

### Authorization
Not applicable — all operations are authorized by the local user.

### Data Protection

| Aspect | Approach |
|--------|----------|
| Encryption at rest | Secrets encrypted using AES-256-GCM with machine-derived key |
| Encryption in transit | N/A for local; HTTPS for API calls to Claude/OpenAI |
| API Keys | Stored encrypted, decrypted only at runtime for API calls |
| Database | SQLite file has standard OS file permissions |

### Secrets Encryption

```typescript
// Key derivation from machine ID + app salt
const key = crypto.scryptSync(machineId + appSalt, salt, 32);

// Encrypt
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
const authTag = cipher.getAuthTag();

// Store: iv + authTag + encrypted (base64)
```

---

## Error Handling Strategy

### Error Categories

| Category | Example | Handling Strategy | User Message |
|----------|---------|-------------------|--------------|
| Validation | Invalid project name | Return 400, show field error | "Project name is required" |
| Not Found | Project doesn't exist | Return 404, show error toast | "Project not found" |
| Database | SQLite error | Log error, return 500 | "Something went wrong. Please try again." |
| AI Provider | Ollama not running | Return provider error, show setup help | "Cannot connect to Ollama. Is it running?" |
| AI Provider | API rate limit | Return 429, show retry option | "Rate limited. Please wait and try again." |
| File System | Path not accessible | Return 403, show path error | "Cannot access this directory. Check permissions." |

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

### Logging Strategy
- Log Level: Info in production, Debug in development
- Log Destination: Console (local app)
- Retention: Session only (no persistent logs in MVP)

---

## Directory Structure

```
bunker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home/redirect
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── layout.tsx      # Dashboard layout
│   │   │   ├── projects/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Project home (roadmap)
│   │   │   │       ├── sprints/
│   │   │   │       └── chat/
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── api/                # API routes
│   │       ├── projects/
│   │       ├── sprints/
│   │       ├── tasks/
│   │       ├── documents/
│   │       ├── chat/
│   │       ├── models/
│   │       ├── files/
│   │       ├── secrets/
│   │       └── settings/
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   ├── projects/           # Project components
│   │   ├── sprints/            # Sprint components
│   │   ├── chat/               # Chat components
│   │   ├── context/            # Context panel components
│   │   └── settings/           # Settings components
│   ├── lib/                    # Utilities and services
│   │   ├── db/                 # Database layer
│   │   │   ├── index.ts        # DB connection
│   │   │   ├── schema.ts       # Drizzle schema
│   │   │   └── migrations/     # DB migrations
│   │   ├── ai/                 # AI integrations
│   │   │   ├── context-builder.ts
│   │   │   ├── ollama.ts
│   │   │   ├── claude.ts
│   │   │   └── openai.ts
│   │   ├── crypto/             # Encryption utilities
│   │   │   └── secrets.ts
│   │   ├── files/              # File system utilities
│   │   │   └── tree.ts
│   │   └── utils.ts            # General utilities
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-project.ts
│   │   ├── use-sprints.ts
│   │   └── use-chat.ts
│   ├── stores/                 # Zustand stores
│   │   ├── project-store.ts
│   │   └── ui-store.ts
│   └── types/                  # TypeScript types
│       └── index.ts
├── public/                     # Static assets
├── drizzle.config.ts           # Drizzle ORM config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json
└── README.md
```

---

**End of TAD**
