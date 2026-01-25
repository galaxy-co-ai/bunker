# Bunker

A unified dashboard that keeps all project files, plans, and context in one place and auto-injects that context into any AI model (local or cloud) so agents actually know what they're building.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Project Management
- Create, edit, and delete projects
- Link projects to local directories
- Quick project switching via sidebar

### Sprint & Task Tracking
- Create sprints with start/end dates
- Add tasks to sprints
- Track progress with visual indicators
- Mark sprints as complete

### Context Panel
- **Docs Tab** - View and manage project documents
- **Files Tab** - Browse project file tree (auto-ignores node_modules, .git, etc.)
- **Sprint Tab** - Quick view of current sprint status

### AI Chat Integration
- **Ollama** - Connect to local models (llama, mistral, codellama, etc.)
- **Claude** - Anthropic API (Claude 3.5 Sonnet, Haiku, Opus)
- **OpenAI** - GPT-4o, GPT-4 Turbo, o1 models
- **Context Injection** - Automatically includes project info, docs, and sprint status

### Settings & Security
- Encrypted API key storage (AES-256-GCM)
- Theme switching (light/dark/system)
- Configurable Ollama endpoint

---

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd bunker
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 20.x or higher |
| npm | 10.x or higher |
| Ollama (optional) | Latest |

---

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

The SQLite database is created automatically on first run at `./data/bunker.db`.

### 3. Start the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

---

## Configuration

### Ollama (Local Models)

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Bunker auto-detects models at `http://localhost:11434`

### Claude API

1. Get an API key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. Go to Settings in Bunker
3. Enter your API key in the Anthropic section

### OpenAI API

1. Get an API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Go to Settings in Bunker
3. Enter your API key in the OpenAI section

---

## Usage

### Creating a Project

1. Click **+ New Project** in the sidebar
2. Enter project name and description
3. (Optional) Set the project path to link local files
4. Click **Create**

### Managing Sprints

1. Navigate to a project
2. Click **Sprints** in the navigation
3. Click **New Sprint** to create one
4. Add tasks with the task input field
5. Check off tasks as you complete them

### Using AI Chat

1. Navigate to a project
2. Click **Chat** in the navigation
3. Select a model from the dropdown
4. Enable "Include project context" for context-aware responses
5. Type your message and press Enter

### Context Panel

Toggle the context panel with the button on the right edge or `Ctrl + .`

- **Docs** - Manage project documentation
- **Files** - Browse project directory structure
- **Sprint** - View current sprint progress

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + B` | Toggle sidebar |
| `Ctrl + .` | Toggle context panel |
| `Ctrl + ,` | Open settings |
| `Ctrl + 1` | Go to project roadmap |
| `Ctrl + 2` | Go to sprints |
| `Ctrl + 3` | Go to chat |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| State | Zustand (client), React Query (server) |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| AI SDK | Vercel AI SDK |
| Validation | Zod |

---

## Project Structure

```
bunker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── projects/[id]/  # Project views
│   │   │   └── settings/       # Settings page
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Sidebar, MainContent, ContextPanel
│   │   ├── projects/           # Project CRUD components
│   │   ├── sprints/            # Sprint/task components
│   │   ├── chat/               # Chat interface
│   │   ├── context/            # Context panel components
│   │   └── settings/           # Settings components
│   ├── lib/
│   │   ├── db/                 # Database (schema, connection)
│   │   ├── ai/                 # AI adapters + context builder
│   │   └── crypto/             # Secrets encryption
│   ├── hooks/                  # React hooks
│   └── stores/                 # Zustand stores
├── data/                       # SQLite database (auto-created)
└── project-planning-docs/      # Planning documentation
```

---

## API Reference

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/[id]` | Get project |
| PATCH | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |

### Sprints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/[id]/sprints` | List sprints |
| POST | `/api/projects/[id]/sprints` | Create sprint |
| GET | `/api/sprints/[id]` | Get sprint |
| PATCH | `/api/sprints/[id]` | Update sprint |
| DELETE | `/api/sprints/[id]` | Delete sprint |
| PATCH | `/api/sprints/[id]/complete` | Complete sprint |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sprints/[id]/tasks` | List tasks |
| POST | `/api/sprints/[id]/tasks` | Create task |
| PATCH | `/api/tasks/[id]` | Update task |
| DELETE | `/api/tasks/[id]` | Delete task |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/[id]/conversations` | List conversations |
| POST | `/api/projects/[id]/conversations` | Create conversation |
| GET | `/api/conversations/[id]/messages` | Get messages |
| POST | `/api/chat` | Send message (streaming) |
| GET | `/api/models` | List available models |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| PATCH | `/api/settings` | Update settings |

---

## Database Schema

| Table | Description |
|-------|-------------|
| `projects` | Project records |
| `sprints` | Time-boxed work periods |
| `tasks` | Items within sprints |
| `documents` | Planning docs per project |
| `conversations` | Chat sessions |
| `messages` | Chat messages |
| `secrets` | Encrypted API keys |
| `settings` | App configuration |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_BASE_URL` | Ollama API endpoint | `http://localhost:11434/v1` |
| `BUNKER_SECRET_KEY` | Encryption key for secrets | Auto-generated |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT

---

Built with [Next.js](https://nextjs.org) and [Vercel AI SDK](https://sdk.vercel.ai)
