# Product Requirements Document: Bunker

**Version:** 1.0  
**Created:** January 25, 2026  
**Author:** GalaxyCo.ai  
**Status:** Draft

---

## User Personas

### Persona: Solo Dev (Primary)
- **Role:** Independent developer or technical founder
- **Goals:** Ship projects faster with AI assistance, maintain context across sessions
- **Pain Points:** Re-explaining project state to AI, losing momentum when switching projects, context scattered across tools
- **Technical Proficiency:** High
- **Usage Frequency:** Daily, multiple hours

### Persona: Small Team Lead
- **Role:** Tech lead managing 2-5 person team
- **Goals:** Keep team aligned, reduce onboarding friction, maintain project documentation
- **Pain Points:** Knowledge silos, inconsistent AI usage across team, project state unclear
- **Technical Proficiency:** High
- **Usage Frequency:** Daily

---

## Feature List (MoSCoW)

### Must Have (MVP)

| ID | Feature | Description | Complexity |
|----|---------|-------------|------------|
| F1 | Project CRUD | Create, read, update, delete projects | M |
| F2 | Project Switcher | Quick-switch between projects with context loading | M |
| F3 | Roadmap View | Visual progress tracking with milestones | L |
| F4 | Sprint Manager | Create, manage, complete sprints with tasks | L |
| F5 | Context Panel | Display planning docs, file tree, current sprint | M |
| F6 | Agent Chat | Chat interface with message history | M |
| F7 | Model Selector | Dropdown to choose AI model provider | S |
| F8 | Ollama Integration | Connect to local Ollama instance | M |
| F9 | Claude API Integration | Connect to Anthropic API | S |
| F10 | OpenAI API Integration | Connect to OpenAI API | S |
| F11 | Context Injection | Auto-prepend project context to AI messages | M |
| F12 | Secrets Manager | Store and use per-project API keys and env vars | M |
| F13 | File Tree | Display project file structure | S |
| F14 | Doc Viewer | View planning documents in context panel | S |
| F15 | SQLite Database | Local persistent storage | M |
| F16 | Settings Page | Configure global app settings | S |

### Should Have (v1.1)

| ID | Feature | Description | Complexity |
|----|---------|-------------|------------|
| F17 | Context Templates | Customizable context injection templates | M |
| F18 | Search | Search across projects, docs, and chat history | L |
| F19 | Export/Import | Backup and restore project data | M |
| F20 | Keyboard Shortcuts | Power-user navigation | S |

### Could Have (Future)

| ID | Feature | Description | Complexity |
|----|---------|-------------|------------|
| F21 | Git Integration | Branch awareness, commit context | L |
| F22 | Cloud Backup | Optional encrypted cloud sync | XL |
| F23 | Team Workspaces | Shared projects with role-based access | XL |
| F24 | MCP Server | Expose Bunker as MCP server for other tools | L |

### Won't Have (Explicitly Excluded)

| Feature | Reason |
|---------|--------|
| User Authentication | Adds complexity, not needed for local-first |
| Real-time Collaboration | Out of scope for MVP, requires infrastructure |
| Mobile App | Desktop-first, mobile is low priority |
| Code Execution | Security risk, out of scope |
| File Editing | Scope creep, use external editor |

---

## User Stories

### Epic: Project Management

#### Story F1-1: Create Project
**As a** solo dev,  
**I want** to create a new project with a name and description,  
**So that** I can start tracking its progress and context.

**Acceptance Criteria:**
- [ ] "New Project" button visible in sidebar
- [ ] Modal opens with fields: name (required), description (optional), path (optional)
- [ ] Project created and appears in project list
- [ ] New project becomes active project
- [ ] Project stored in SQLite

**Edge Cases:**
- Empty name: Show validation error "Project name required"
- Duplicate name: Allow (projects have unique IDs)
- Very long name (>100 chars): Truncate in UI, store full name

---

#### Story F1-2: Edit Project
**As a** solo dev,  
**I want** to edit a project's name, description, and settings,  
**So that** I can keep project info current.

**Acceptance Criteria:**
- [ ] Edit option in project context menu
- [ ] Modal opens with current values pre-filled
- [ ] Changes saved to database
- [ ] UI updates immediately

**Edge Cases:**
- Edit while project is active: Changes reflect immediately
- Clear required field: Validation prevents save

---

#### Story F1-3: Delete Project
**As a** solo dev,  
**I want** to delete a project I no longer need,  
**So that** my project list stays manageable.

**Acceptance Criteria:**
- [ ] Delete option in project context menu
- [ ] Confirmation dialog: "Delete [project name]? This cannot be undone."
- [ ] Project removed from database (cascade: sprints, tasks, chat history, secrets)
- [ ] If deleted project was active, switch to another project or show empty state

**Edge Cases:**
- Delete last project: Show "Create your first project" empty state
- Accidental click: Confirmation prevents data loss

---

#### Story F2-1: Switch Projects
**As a** solo dev,  
**I want** to quickly switch between projects,  
**So that** I can work on multiple projects without losing context.

**Acceptance Criteria:**
- [ ] Project list visible in sidebar
- [ ] Click project to switch
- [ ] Context panel updates to show new project's docs, files, sprint
- [ ] Chat clears or shows new project's chat history
- [ ] Switch takes < 500ms

**Edge Cases:**
- Switch with unsaved chat: Chat auto-saves before switch
- Switch to project with no docs: Show "Add context" prompt

---

### Epic: Progress Tracking

#### Story F3-1: View Roadmap
**As a** solo dev,  
**I want** to see my project's progress as a visual roadmap,  
**So that** I can understand where I am and what's next.

**Acceptance Criteria:**
- [ ] Roadmap tab in main view
- [ ] Shows milestones as timeline or kanban
- [ ] Current progress indicated visually (percentage, progress bar)
- [ ] Milestones can be added, edited, marked complete

**Edge Cases:**
- No milestones: Show "Add your first milestone" prompt
- Many milestones (>20): Scrollable view, consider pagination

---

#### Story F4-1: Create Sprint
**As a** solo dev,  
**I want** to create a sprint with a name and date range,  
**So that** I can time-box my work.

**Acceptance Criteria:**
- [ ] "New Sprint" button in sprint panel
- [ ] Fields: name, start date, end date
- [ ] Sprint created and shown in sprint list
- [ ] Sprint can be set as "current sprint"

**Edge Cases:**
- Overlapping dates with existing sprint: Allow (user's choice)
- End date before start date: Validation error

---

#### Story F4-2: Manage Sprint Tasks
**As a** solo dev,  
**I want** to add, edit, and complete tasks within a sprint,  
**So that** I can track sprint progress.

**Acceptance Criteria:**
- [ ] Tasks displayed within sprint view
- [ ] Add task with title (required) and description (optional)
- [ ] Mark task complete (checkbox or status toggle)
- [ ] Reorder tasks via drag-and-drop
- [ ] Sprint progress shows X/Y tasks complete

**Edge Cases:**
- Empty sprint: Show "Add tasks to this sprint"
- Complete all tasks: Show completion celebration, prompt to close sprint

---

#### Story F4-3: Complete Sprint
**As a** solo dev,  
**I want** to close a sprint when it's done,  
**So that** I can move to the next phase.

**Acceptance Criteria:**
- [ ] "Complete Sprint" button when sprint is current
- [ ] Incomplete tasks prompt: "Move to next sprint or mark as incomplete?"
- [ ] Sprint archived with completion date
- [ ] Next sprint (if exists) becomes current

**Edge Cases:**
- No next sprint: Prompt to create one or leave no current sprint

---

### Epic: Context Management

#### Story F5-1: View Context Panel
**As a** solo dev,  
**I want** to see my project's context in a dedicated panel,  
**So that** I know what the AI knows about my project.

**Acceptance Criteria:**
- [ ] Context panel visible in main layout (collapsible)
- [ ] Tabs: Docs, Files, Sprint
- [ ] Docs tab shows planning documents
- [ ] Files tab shows project file tree
- [ ] Sprint tab shows current sprint tasks

**Edge Cases:**
- No docs: Show "Add planning documents" prompt
- No file path set: Show "Set project path to see files"

---

#### Story F13-1: Browse File Tree
**As a** solo dev,  
**I want** to see my project's file structure,  
**So that** I can reference it and include it in context.

**Acceptance Criteria:**
- [ ] File tree displays folders and files
- [ ] Folders expandable/collapsible
- [ ] Common ignores applied (.git, node_modules, etc.)
- [ ] Click file to view content (read-only)

**Edge Cases:**
- Project path not set: Show "Configure project path"
- Path doesn't exist: Show error "Directory not found"
- Large directory (>1000 files): Lazy load, show warning

---

#### Story F14-1: View Planning Docs
**As a** solo dev,  
**I want** to view my planning documents in the context panel,  
**So that** I can reference them while chatting with AI.

**Acceptance Criteria:**
- [ ] Docs tab lists available documents
- [ ] Click doc to view content (markdown rendered)
- [ ] Docs can be added from file system
- [ ] Docs can be added via paste/create

**Edge Cases:**
- No docs: Show "Add your first document"
- Large doc (>100KB): Truncate preview, "Open full" option

---

### Epic: AI Chat

#### Story F6-1: Send Message
**As a** solo dev,  
**I want** to send messages to an AI model,  
**So that** I can get coding assistance.

**Acceptance Criteria:**
- [ ] Text input at bottom of chat panel
- [ ] Send button and Enter key submit message
- [ ] Message appears in chat history immediately
- [ ] AI response streams in below user message
- [ ] Messages stored in database per project

**Edge Cases:**
- Empty message: Prevent send
- No model configured: Show "Select a model to start chatting"
- API error: Show error message, allow retry

---

#### Story F6-2: View Chat History
**As a** solo dev,  
**I want** to see my chat history with the AI,  
**So that** I can reference previous conversations.

**Acceptance Criteria:**
- [ ] Chat history displays user and AI messages
- [ ] Messages show timestamp
- [ ] History persists across sessions
- [ ] Scrollable with newest at bottom

**Edge Cases:**
- Very long history (>500 messages): Paginate or virtual scroll
- New session: Load most recent conversation or show welcome

---

#### Story F7-1: Select Model
**As a** solo dev,  
**I want** to choose which AI model to use,  
**So that** I can use local or cloud models as needed.

**Acceptance Criteria:**
- [ ] Model dropdown in chat header
- [ ] Options: Ollama models, Claude API, OpenAI API
- [ ] Selected model persists per project
- [ ] Switching model doesn't clear chat history

**Edge Cases:**
- No models configured: Show "Configure models in settings"
- Selected model unavailable: Show error, prompt to select another

---

#### Story F11-1: Auto-Inject Context
**As a** solo dev,  
**I want** project context automatically added to my AI messages,  
**So that** the AI understands my project without manual copy-paste.

**Acceptance Criteria:**
- [ ] Context prepended to user messages (not visible in UI, sent to API)
- [ ] Context includes: project description, current sprint, recent tasks
- [ ] Context toggle: user can disable per-message if needed
- [ ] Context preview: user can see what's being injected

**Edge Cases:**
- Context too large for model: Truncate intelligently, warn user
- No context available: Send message without context

---

### Epic: Model Integrations

#### Story F8-1: Connect Ollama
**As a** solo dev,  
**I want** to connect to my local Ollama instance,  
**So that** I can use local AI models.

**Acceptance Criteria:**
- [ ] Settings page has Ollama configuration section
- [ ] Input for Ollama URL (default: http://localhost:11434)
- [ ] "Test Connection" button validates connectivity
- [ ] Available models fetched and shown in model dropdown

**Edge Cases:**
- Ollama not running: Show "Cannot connect to Ollama at [URL]"
- No models pulled: Show "No models found. Pull a model with `ollama pull`"

---

#### Story F9-1: Connect Claude API
**As a** solo dev,  
**I want** to use Claude via API,  
**So that** I can use Anthropic's models.

**Acceptance Criteria:**
- [ ] Settings page has Claude API section
- [ ] Input for API key (masked)
- [ ] "Test Connection" validates key
- [ ] Claude models appear in dropdown when key valid

**Edge Cases:**
- Invalid key: Show "Invalid API key"
- Rate limited: Show error, suggest retry

---

#### Story F10-1: Connect OpenAI API
**As a** solo dev,  
**I want** to use OpenAI models via API,  
**So that** I can use GPT models.

**Acceptance Criteria:**
- [ ] Settings page has OpenAI API section
- [ ] Input for API key (masked)
- [ ] "Test Connection" validates key
- [ ] OpenAI models appear in dropdown when key valid

**Edge Cases:**
- Invalid key: Show "Invalid API key"
- Rate limited: Show error, suggest retry

---

### Epic: Secrets Management

#### Story F12-1: Store Project Secrets
**As a** solo dev,  
**I want** to store API keys and environment variables per project,  
**So that** I can manage different credentials for different projects.

**Acceptance Criteria:**
- [ ] Secrets panel in project settings
- [ ] Add secret: key (name), value (masked input)
- [ ] Edit and delete secrets
- [ ] Secrets stored encrypted in SQLite
- [ ] Secrets available for context injection (opt-in)

**Edge Cases:**
- Duplicate key name: Update existing or show error
- Very long value: Allow (stored as text)

---

### Epic: Settings

#### Story F16-1: Configure Global Settings
**As a** solo dev,  
**I want** to configure app-wide settings,  
**So that** I can customize Bunker to my preferences.

**Acceptance Criteria:**
- [ ] Settings page accessible from sidebar
- [ ] Sections: General, Models, Appearance
- [ ] General: default project path, file ignores
- [ ] Models: Ollama URL, Claude API key, OpenAI API key
- [ ] Appearance: theme (light/dark/system)
- [ ] Settings persist in SQLite

**Edge Cases:**
- Invalid settings: Validation prevents save
- Reset to defaults: Confirmation dialog

---

## Dependencies

| Dependency | Type | Owner | Risk Level | Fallback |
|------------|------|-------|------------|----------|
| Ollama | External | User's machine | Medium | Claude/OpenAI as alternatives |
| Claude API | External | Anthropic | Low | Ollama/OpenAI as alternatives |
| OpenAI API | External | OpenAI | Low | Ollama/Claude as alternatives |
| SQLite | Library | better-sqlite3 | Low | N/A (core dependency) |
| Next.js 15 | Framework | Vercel | Low | N/A (core dependency) |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Project switch < 500ms |
| Performance | Chat message send < 100ms (before API response) |
| Performance | File tree load < 1s for 1000 files |
| Storage | All data in local SQLite, no cloud |
| Security | Secrets encrypted at rest |
| Security | No data leaves machine unless user sends to API |
| Accessibility | Keyboard navigable |
| Accessibility | Screen reader compatible for core flows |

---

**End of PRD**
