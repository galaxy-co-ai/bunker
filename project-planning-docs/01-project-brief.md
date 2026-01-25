# Project Brief: Bunker

**Version:** 1.0  
**Created:** January 25, 2026  
**Author:** GalaxyCo.ai  
**Status:** Draft

---

## Problem Statement

**Solo developers and small teams** experience **fragmented context** when **working with AI coding assistants across multiple projects**.

This causes **constant re-explaining of project state, architecture, and goals** resulting in **wasted time steering agents instead of shipping code**.

Current solutions fail because:
- AI tools have no persistent project memory
- Context windows reset every session
- Each tool requires manual context loading
- Project knowledge lives in scattered docs, files, and heads
- Switching projects means rebuilding context from scratch

---

## Vision

**One dashboard. Total context. Any model.**

When complete, developers will be able to **switch between projects and immediately have any AI model understand their codebase, plans, and current sprint** without **copy-pasting context, re-explaining architecture, or losing momentum**.

---

## Success Metrics

| Metric | Current State | Target | Measurement Method |
|--------|---------------|--------|-------------------|
| Time to productive AI session | 5-10 min context setup | < 30 seconds | Stopwatch: project switch → first useful response |
| Context accuracy | Manual, inconsistent | 100% auto-injection | Agent knows current task without prompting |
| Projects manageable | Mental juggling | Unlimited with instant switch | UI supports N projects with instant context load |
| Local-first operation | Cloud-dependent tools | 100% offline capable | Works with no internet connection |

---

## Scope

### In Scope (MVP)
- Project creation and management
- Progress tracking with roadmap view
- Sprint manager (create, track, complete sprints)
- Project switcher with instant context loading
- Context panel (planning docs, file tree, current sprint)
- Agent chat interface
- Model selector (Ollama local, Claude API, OpenAI API)
- Auto-injection of project context into AI messages
- Per-project secrets management (API keys, env vars)
- SQLite local database
- Desktop-first responsive UI

### Out of Scope (MVP)
- User authentication / accounts
- Cloud sync / backup
- Team collaboration features
- Real-time multiplayer editing
- Mobile-optimized UI
- Plugin / extension system
- Git integration
- Code execution in chat
- File editing from chat
- Voice input

### Deferred to Future
- Cloud backup (opt-in)
- Team workspaces
- Git branch awareness
- Code apply from chat
- Custom context templates
- MCP server integration
- Embedding-based context retrieval

---

## Assumptions

| Assumption | Risk if Wrong | Mitigation |
|------------|---------------|------------|
| Users have Ollama installed or API keys ready | Can't use chat feature | Clear onboarding: "Add a model to get started" |
| SQLite handles project scale (< 100 projects, < 10K files indexed) | Performance degrades | Monitor query times, add pagination early |
| Users understand what "context" means | Feature confusion | In-app explanation, visual context preview |
| Local-first is a feature, not a limitation | Users want cloud sync | Position as privacy/speed benefit, plan cloud as v2 |
| Next.js can run as local desktop app | Distribution issues | Validate Electron/Tauri wrapper early if needed |

---

## Constraints

| Type | Constraint | Rationale |
|------|------------|-----------|
| Technical | 100% local operation | Core value prop — no cloud dependency, no accounts |
| Technical | SQLite only | Simple, portable, no database server required |
| Technical | Next.js 15 + TypeScript strict | Team standard, type safety |
| Technical | Ollama integration required | Primary local model runtime |
| UX | Single-user, no auth | Reduces complexity, ships faster |
| UX | Desktop-first | Primary use case is development workstation |

---

## Key Terms

| Term | Definition |
|------|------------|
| **Project** | A development project with associated files, plans, and context |
| **Context** | The combined knowledge about a project: docs, file tree, sprint state, custom notes |
| **Context Injection** | Automatically prepending project context to AI messages |
| **Sprint** | A time-boxed set of tasks within a project |
| **Roadmap** | High-level project milestones and progress visualization |
| **Model Provider** | An AI service: Ollama (local), Claude API, OpenAI API |
| **Secrets** | Per-project sensitive data: API keys, env vars |

---

**End of Project Brief**
