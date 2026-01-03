# BUNKER Roadmap

## Current Status: Phase 7 In Progress

---

## Phase 1 - UI Foundation (Complete)
- [x] Fallout-themed dashboard UI
- [x] System Health panel (model status display)
- [x] Task Flow visualization
- [x] Live Queue component
- [x] Operations Log (terminal-style)
- [x] Cost Tracker panel
- [x] Quick Actions
- [x] Boot sequence animation
- [x] Production build pipeline

## Phase 2 - Roster System (Complete)
- [x] Agent schema & TypeScript types
- [x] Tool schema & TypeScript types
- [x] Roster data store
- [x] View modes (toggle between):
  - [x] Card Grid view
  - [x] Table/List view
  - [x] Depth Chart view
  - [x] Org Chart view
- [ ] Agent CRUD operations
- [ ] Tool CRUD operations
- [ ] KPI dashboard per agent/tool
- [x] Hierarchy & reporting structure
- [x] Fallback chain visualization

## Phase 3 - Core Integrations (Complete)
- [ ] Ollama API connection (local model management)
- [ ] Real-time system stats (CPU, RAM, GPU)
- [ ] Model hot-swap functionality
- [ ] n8n Pro webhook integration
- [x] Cloud API connections (toggleable):
  - [x] Claude API (streaming support)
  - [ ] OpenAI
  - [ ] Gemini
  - [ ] Perplexity
- [x] API key management (secure storage via Tauri keyring)
- [x] Connection status indicators (live)

## Phase 4 - Embedded Terminal & Claude Code (Complete)
- [x] xterm.js terminal component
- [x] PTY integration (Rust backend with portable-pty)
- [x] Claude Code CLI embedded in BUNKER (via terminal)
- [x] Terminal theming (match Fallout aesthetic)
- [ ] Command history & persistence
- [x] Multi-tab terminal support

## Phase 5 - Metrics & Cost Tracking (Complete - NEW)
- [x] Real-time API call tracking (tokens, cost, response time)
- [x] Zustand store with localStorage persistence
- [x] Cost summaries (today, week, month, all-time)
- [x] Token usage aggregation
- [x] Success/failure rate tracking
- [x] Dashboard components wired to real data (no more mock data)
- [x] Rust backend metrics persistence via Tauri store

## Phase 6 - Claude Tool Use System (Complete - NEW)
- [x] Extended Claude API types for tool use (Rust + TypeScript)
- [x] Tool trait system with async execution
- [x] Built-in tools:
  - [x] `read_file` - Read file contents with size limits
  - [x] `write_file` - Create/write files with directory creation
  - [x] `search_files` - Glob pattern matching + content search
  - [x] `execute_command` - Shell command execution with timeout
  - [x] `list_directory` - Recursive directory listing
- [x] Tool registry with dynamic registration
- [x] Tauri IPC commands for tool execution
- [x] Frontend ToolUseBlock component for chat display
- [x] Path sandboxing support for security

## Phase 7 - Agentic Features (In Progress - NEW)
- [ ] n8n workflow integration
  - [ ] n8n HTTP client (Rust)
  - [ ] Webhook trigger tool
  - [ ] Workflow listing & status
  - [ ] Settings panel configuration
- [ ] Agent chat experience
  - [ ] Agent picker UI
  - [ ] Agent-specific system prompts
  - [ ] Tool use display in chat stream
  - [ ] Multi-turn agentic conversations
- [ ] Complete dashboard polish
  - [ ] Remove remaining mock data
  - [ ] Real-time task flow from active operations

## Phase 8 - Automation & Workflows (Planned)
- [ ] n8n workflow triggers from BUNKER
- [ ] Task routing engine (local vs cloud)
- [ ] Cost optimization algorithms
- [ ] Batch processing queue
- [ ] Scheduled tasks

## Phase 9 - Advanced Features (Planned)
- [ ] Multi-project workspace support
- [ ] Conversation history with Claude
- [ ] Custom prompt templates
- [ ] Analytics dashboard
- [ ] Export/reporting

---

## Architecture

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── bunker/      # Dashboard components
│   ├── chat/        # Claude chat UI
│   ├── roster/      # Agent roster views
│   ├── settings/    # Settings panel
│   └── terminal/    # xterm.js terminal
├── lib/
│   ├── services/    # Tauri bridge
│   ├── store/       # Zustand stores
│   └── types/       # TypeScript types
```

### Backend (Rust + Tauri)
```
src-tauri/src/
├── claude/          # Claude API client
│   ├── client.rs    # HTTP client with streaming
│   ├── commands.rs  # Tauri commands
│   └── types.rs     # API types with tool use
├── metrics/         # Usage tracking
│   ├── commands.rs  # Metrics Tauri commands
│   └── types.rs     # Metric data structures
├── terminal/        # PTY management
│   ├── pty.rs       # portable-pty wrapper
│   └── commands.rs  # Terminal Tauri commands
├── tools/           # Agent tool system
│   ├── types.rs     # Tool trait & context
│   ├── registry.rs  # Tool registration
│   ├── file_ops.rs  # File tools
│   ├── terminal.rs  # Command execution
│   └── commands.rs  # Tool Tauri commands
├── keyring.rs       # Secure API key storage
└── error.rs         # Error types
```

---

## AI Infrastructure Stack

### Local (Planned)
| Tool | Purpose |
|------|---------|
| Ollama | Local LLM runtime |
| Llama 8B | Fast tasks |
| Nemotron 30B | Medium complexity |
| Llama 70B | Heavy reasoning |

### Cloud APIs (Active)
| Provider | Status | Purpose |
|----------|--------|---------|
| Claude API | **Active** | Complex reasoning, tool use |
| OpenAI | Planned | GPT models, embeddings |
| Gemini | Planned | Google models |
| Perplexity | Planned | Search-augmented AI |

### Orchestration
| Tool | Status | Purpose |
|------|--------|---------|
| n8n Pro | In Progress | Workflow automation |
| Apollo API | Planned | Contact/lead data |

---

## Recent Changes (January 2025)

### Added
- Metrics tracking system (API calls, costs, tokens)
- Claude tool use support (5 built-in tools)
- Tool execution via Tauri IPC
- Real data in dashboard (replacing mock data)
- ToolUseBlock component for chat

### Fixed
- PTY Send+Sync compilation error
- StreamChunk type extensions for tool use

### Technical Debt
- Unused import warnings (non-blocking)
- Some tool types not yet used in frontend
