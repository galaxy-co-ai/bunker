# Clawdbot Integration Prompt for Claude Code

**Goal:** Replace Bunker's current AI brain with Clawdbot, using Clawdbot's OpenAI-compatible HTTP API.

---

## What is Clawdbot?

Clawdbot is a local AI gateway that provides:
- Persistent memory across sessions
- Tool use (file access, browser control, web search, etc.)
- Multi-agent orchestration
- An OpenAI-compatible `/v1/chat/completions` endpoint

The Gateway runs locally and can be accessed via HTTP.

---

## Integration Approach

Clawdbot exposes `POST /v1/chat/completions` which is OpenAI-compatible. This means:
1. Bunker can use the existing OpenAI SDK
2. Just change the base URL to point to Clawdbot Gateway
3. Clawdbot handles the actual AI reasoning with all its capabilities

---

## Configuration

**Clawdbot Gateway defaults:**
- Host: `127.0.0.1`
- Port: `18789`
- Endpoint: `/v1/chat/completions`

**Authentication:**
- Bearer token via `Authorization: Bearer <token>`
- Token is set in Clawdbot config as `gateway.auth.token` or via `CLAWDBOT_GATEWAY_TOKEN` env var

**Agent selection:**
- Use `model: "clawdbot:main"` or `model: "clawdbot:<agentId>"`
- Or header: `x-clawdbot-agent-id: main`

**Session persistence:**
- Include `user` field in request for persistent sessions
- Or use `x-clawdbot-session-key` header for explicit session control

---

## Implementation Steps

### 1. Add environment variables

```env
# .env.local
CLAWDBOT_GATEWAY_URL=http://127.0.0.1:18789
CLAWDBOT_GATEWAY_TOKEN=your_token_here
CLAWDBOT_AGENT_ID=main
```

### 2. Create Clawdbot client utility

```typescript
// src/lib/clawdbot.ts

import OpenAI from 'openai';

export function getClawdbot() {
  const baseURL = process.env.CLAWDBOT_GATEWAY_URL || 'http://127.0.0.1:18789';
  const apiKey = process.env.CLAWDBOT_GATEWAY_TOKEN || '';
  
  return new OpenAI({
    baseURL: `${baseURL}/v1`,
    apiKey,
    defaultHeaders: {
      'x-clawdbot-agent-id': process.env.CLAWDBOT_AGENT_ID || 'main',
    },
  });
}
```

### 3. Update AI chat calls

**Before (OpenAI direct):**
```typescript
import { getOpenAI } from '@/lib/ai-providers';

const openai = getOpenAI();
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  stream: true,
});
```

**After (Clawdbot):**
```typescript
import { getClawdbot } from '@/lib/clawdbot';

const clawdbot = getClawdbot();
const response = await clawdbot.chat.completions.create({
  model: 'clawdbot:main',  // or 'clawdbot:bunker' for a dedicated agent
  messages: [...],
  stream: true,
  user: `bunker:${workspaceId}`,  // For session persistence
});
```

### 4. Enable the endpoint in Clawdbot config

The user needs to enable the HTTP endpoint in their Clawdbot config:

```json5
{
  gateway: {
    http: {
      endpoints: {
        chatCompletions: { enabled: true }
      }
    }
  }
}
```

---

## Session Persistence

For Bunker to maintain conversation context:

**Option A: Use `user` field**
```typescript
user: `bunker:workspace:${workspaceId}:project:${projectId}`
```
Clawdbot derives a stable session from this string.

**Option B: Use explicit session key**
```typescript
defaultHeaders: {
  'x-clawdbot-session-key': `bunker-${workspaceId}-${projectId}`,
}
```

---

## Streaming Support

Clawdbot supports SSE streaming just like OpenAI:

```typescript
const stream = await clawdbot.chat.completions.create({
  model: 'clawdbot:main',
  messages: [...],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    // Stream to client
  }
}
```

---

## Files to Modify

1. **`src/lib/clawdbot.ts`** — New file, Clawdbot client
2. **`src/lib/ai-providers.ts`** — Add Clawdbot as provider option
3. **Any file using `getOpenAI()`** — Switch to `getClawdbot()` for Bunker AI features
4. **`.env.local`** — Add Clawdbot env vars
5. **`.env.example`** — Document new env vars

---

## Testing

1. Ensure Clawdbot Gateway is running: `clawdbot gateway status`
2. Test endpoint manually:
```bash
curl http://127.0.0.1:18789/v1/chat/completions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"clawdbot:main","messages":[{"role":"user","content":"hello"}]}'
```
3. Run Bunker and test AI features

---

## Notes

- Clawdbot handles all the AI model selection internally (Claude, GPT, etc.)
- Bunker doesn't need to manage API keys for OpenAI/Anthropic — Clawdbot does that
- Clawdbot brings memory, tools, and multi-agent capabilities automatically
- The `model` field is used to select which Clawdbot agent handles the request
