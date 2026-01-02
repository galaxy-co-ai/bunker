# BUNKER Setup Guide

## What YOU Need To Do

### 1. Install Ollama (Local LLM Runtime)

**Download and install:**
```
https://ollama.ai/download
```

After installing, Ollama runs as a service on `http://localhost:11434`

### 2. Download Local Models

Open a terminal and run these commands to download models:

```bash
# Fast lightweight model (8GB RAM) - RECOMMENDED FIRST
ollama pull llama3.2:8b

# Medium model (16-24GB RAM)
ollama pull nemotron:70b

# Large model (40GB+ RAM) - Only if you have the hardware
ollama pull llama3.3:70b
```

**Recommended starting point:** Just pull `llama3.2:8b` first. You can add more later.

### 3. Get API Keys (For Cloud APIs)

You'll need API keys for the cloud services you want to use. All are optional and toggleable.

| Service | Get Key At | Required? |
|---------|-----------|-----------|
| **Claude API** | https://console.anthropic.com | Optional |
| **OpenAI** | https://platform.openai.com/api-keys | Optional |
| **Gemini** | https://makersuite.google.com/app/apikey | Optional |
| **Perplexity** | https://www.perplexity.ai/settings/api | Optional |

### 4. n8n Pro Setup

You mentioned you have an n8n Pro account. You'll need:
- Your n8n instance URL (e.g., `https://your-instance.app.n8n.cloud`)
- API key or webhook URLs for triggering workflows

### 5. Apollo API (Optional)

If using Apollo for lead/contact enrichment:
- Get API key at: https://app.apollo.io/#/settings/integrations/api

---

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 16GB | 32GB+ |
| GPU VRAM | 8GB | 16GB+ |
| Storage | 50GB free | 100GB+ free |

**For local models:**
- Llama 8B: ~8GB RAM
- Nemotron 70B: ~40GB RAM (or GPU VRAM)
- Llama 70B: ~40GB RAM (or GPU VRAM)

---

## Quick Start Checklist

- [ ] Install Ollama
- [ ] Pull at least one model: `ollama pull llama3.2:8b`
- [ ] Verify Ollama is running: `curl http://localhost:11434/api/tags`
- [ ] (Optional) Get Claude API key
- [ ] (Optional) Get OpenAI API key
- [ ] (Optional) Get Gemini API key
- [ ] (Optional) Get Perplexity API key
- [ ] (Optional) Set up n8n webhooks

---

## Verifying Setup

### Check Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

Should return a list of installed models.

### Check a model works:
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:8b",
  "prompt": "Hello!",
  "stream": false
}'
```

---

## Running BUNKER

After setup, just run the executable:
```
C:\Users\Owner\workspace\bunker\src-tauri\target\release\bunker.exe
```

Or create a desktop shortcut to that path.

---

## Next Steps

Once you have Ollama + at least one model running:
1. Open BUNKER
2. Go to ROSTER tab
3. You'll see all agents and tools
4. Tools will show as OFFLINE until connected
5. We'll integrate real connections in Phase 3
