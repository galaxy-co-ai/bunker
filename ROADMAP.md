# BUNKER Roadmap

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

## Phase 2 - Roster System (Agents, Tools, Tech Stack)
- [ ] Agent schema & TypeScript types
- [ ] Tool schema & TypeScript types
- [ ] Roster data store
- [ ] View modes (toggle between):
  - [ ] Card Grid view
  - [ ] Table/List view
  - [ ] Depth Chart view
  - [ ] Org Chart view
- [ ] Agent CRUD operations
- [ ] Tool CRUD operations
- [ ] KPI dashboard per agent/tool
- [ ] Hierarchy & reporting structure
- [ ] Fallback chain visualization

## Phase 3 - Core Integrations
- [ ] Ollama API connection (local model management)
- [ ] Real-time system stats (CPU, RAM, GPU)
- [ ] Model hot-swap functionality
- [ ] n8n Pro webhook integration
- [ ] Cloud API connections (toggleable):
  - [ ] Claude API
  - [ ] OpenAI
  - [ ] Gemini
  - [ ] Perplexity
- [ ] API key management (secure storage)
- [ ] Connection status indicators (live)

## Phase 4 - Embedded Terminal & Claude Code
- [ ] xterm.js terminal component
- [ ] PTY integration (Rust backend)
- [ ] Claude Code CLI embedded in BUNKER
- [ ] Terminal theming (match Fallout aesthetic)
- [ ] Command history & persistence
- [ ] Multi-tab terminal support

## Phase 5 - Automation & Workflows
- [ ] n8n workflow triggers from BUNKER
- [ ] Task routing engine (local vs cloud)
- [ ] Cost optimization algorithms
- [ ] Batch processing queue
- [ ] Scheduled tasks

## Phase 6 - Advanced Features
- [ ] Multi-project workspace support
- [ ] Conversation history with Claude
- [ ] Custom prompt templates
- [ ] Analytics dashboard
- [ ] Export/reporting

---

## AI Infrastructure Stack

### Local
| Tool | Purpose |
|------|---------|
| Ollama | Local LLM runtime |
| Llama 8B | Fast tasks |
| Nemotron 30B | Medium complexity |
| Llama 70B | Heavy reasoning |

### Cloud APIs (Toggleable)
| Provider | Purpose |
|----------|---------|
| Claude API | Complex reasoning |
| OpenAI | GPT models, embeddings |
| Gemini | Google models |
| Perplexity | Search-augmented AI |

### Orchestration
| Tool | Purpose |
|------|---------|
| n8n Pro | Workflow automation |
| Apollo API | Contact/lead data |
