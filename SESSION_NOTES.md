# BUNKER Session Notes

**Last Updated:** January 3, 2025
**Session End Reason:** Context limit reached (~7% remaining)

---

## PICK UP HERE

### Current Status: Phase 7 - Agentic Features (In Progress)

Phases 1-6 are **complete and pushed to GitHub**. The app builds and runs.

### What's Left to Build (Phase 7):

1. **n8n Integration** (not started)
   - Create `src-tauri/src/n8n/` module
   - HTTP client for n8n API
   - Webhook trigger tool
   - Settings panel config for n8n URL/API key

2. **Agent Chat Experience** (partially done)
   - ToolUseBlock component exists but not wired into chat stream
   - Need agent picker UI
   - Need agent-specific system prompts
   - Need to handle tool_use stop_reason in chat loop

3. **Dashboard Polish**
   - Task flow still uses some mock data
   - Wire remaining components to real metrics

---

## What Was Done This Session

### Phase 5: Metrics & Cost Tracking (COMPLETE)
- `src/lib/store/metrics-store.ts` - Zustand store with persistence
- `src-tauri/src/metrics/` - Rust backend for metrics
- Dashboard now shows real API usage data
- Cost tracking: today, week, month, all-time

### Phase 6: Claude Tool Use (COMPLETE)
- Extended Claude API types for tool use (Rust + TypeScript)
- Created 5 built-in tools:
  - `read_file` - Read file contents
  - `write_file` - Create/write files
  - `search_files` - Glob + content search
  - `execute_command` - Shell commands with timeout
  - `list_directory` - Recursive directory listing
- Tool registry with dynamic registration
- Tauri IPC commands for execution
- `ToolUseBlock.tsx` component created

### Bug Fixes
- Fixed PTY `Send+Sync` issue (changed `RwLock` to `Mutex`)
- Fixed `StreamChunk` type to include `tool_use` and `stop_reason`

---

## How to Run

```bash
cd C:\Users\Dalto\bunker
npm run tauri dev
```

**To use Claude chat:**
1. Click SETTINGS (top right)
2. Add your ANTHROPIC_API_KEY
3. Go to CLAUDE tab

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src-tauri/src/tools/` | Tool system (registry, built-in tools) |
| `src-tauri/src/claude/client.rs` | Claude API with tool use methods |
| `src/lib/store/chat-store.ts` | Chat state with metrics integration |
| `src/components/chat/ToolUseBlock.tsx` | Tool use display (not yet wired) |
| `ROADMAP.md` | Full project status |

---

## Git Status

- **Branch:** main
- **Last Commit:** `4ce21fb` - feat: Add metrics tracking, Claude tool use, and agentic infrastructure
- **Remote:** https://github.com/galaxy-co-ai/bunker.git
- All changes pushed, working tree clean

---

## Next Session Priorities

1. **Quick win:** Wire ToolUseBlock into chat stream
2. **Medium:** Create n8n module (HTTP client, webhook tool)
3. **Polish:** Agent picker UI, system prompts per agent

---

## Notes for Claude

- User is on laptop (no local LLMs)
- Using Claude API as primary
- n8n not yet set up but should be integrated 100%
- User wants full agentic chat experience
- Don't simplify - build out all features completely
