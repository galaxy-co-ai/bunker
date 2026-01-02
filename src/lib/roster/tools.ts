// ═══════════════════════════════════════════════════════════════
// BUNKER Tool Roster - GalaxyCo Technical Infrastructure
// Based on GalaxyCo-Technical-Infrastructure-Standard.docx
// ═══════════════════════════════════════════════════════════════

import type { Tool } from './types';

export const tools: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // LOCAL AI INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════

  // Runtime
  {
    identity: {
      name: 'Ollama',
      codename: 'LOCAL-RUNTIME',
      id: 'tool-001',
      type: 'internal',
      status: 'offline',
      icon: 'server',
    },
    role: {
      category: 'llm-runtime',
      purpose: 'Local LLM runtime - hosts and serves local models',
      responsibilities: [
        'Load and unload models on demand',
        'Serve inference requests via API',
        'Manage GPU/CPU memory allocation',
        'Model version management',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: ['tool-006', 'tool-007', 'tool-008', 'tool-009'],
      failover_trigger: 'Health check fails 3 consecutive times',
    },
    integration: {
      connects_to: ['BUNKER', 'n8n', 'LiteLLM'],
      exposed_via: 'internal',
      consumers: ['agent-001', 'agent-002', 'agent-003', 'agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: false,
      api_key_set: true,
      endpoint: 'http://localhost:11434',
    },
    kpis: {
      metrics: [
        { name: 'uptime', target: 99.5, unit: '%' },
        { name: 'avg_response_time', target: 2000, unit: 'ms' },
        { name: 'models_loaded', target: 1, unit: 'count' },
      ],
      health_check: 'GET http://localhost:11434/api/tags returns 200',
    },
    meta: {
      version: '0.5.x',
      docs_url: 'https://ollama.ai/docs',
      owner_agent: 'agent-001',
      changelog: ['Added to BUNKER stack'],
    },
  },

  // Local Models
  {
    identity: {
      name: 'Llama 3.3 70B',
      codename: 'LOCAL-REASONING',
      id: 'tool-002',
      type: 'internal',
      status: 'offline',
      icon: 'brain',
    },
    role: {
      category: 'llm-model',
      purpose: 'Complex analysis, planning, document generation',
      responsibilities: [
        'Complex multi-step reasoning',
        'Long-form document generation',
        'Code architecture and review',
        'Strategic planning tasks',
      ],
      dependencies: ['tool-001'],
    },
    fallback: {
      backup_tools: ['tool-006'], // Claude API fallback
      failover_trigger: 'Model not loaded OR response time > 60s OR VRAM insufficient',
    },
    integration: {
      connects_to: ['BUNKER', 'LiteLLM'],
      exposed_via: 'internal',
      consumers: ['agent-001'],
    },
    config: {
      enabled: true,
      api_key_required: false,
      api_key_set: true,
      settings: {
        model_name: 'llama3.3:70b',
        context_length: 128000,
        parameters: '70B',
        quantization: 'Q4_K_M',
        vram_required: '40GB',
        note: 'Currently spills to RAM - 30-60s inference until GPU upgrade',
      },
    },
    kpis: {
      metrics: [
        { name: 'avg_response_time', target: 15000, unit: 'ms' },
        { name: 'quality_score', target: 4.5, unit: '/5' },
        { name: 'tasks_per_day', target: 50, unit: 'count' },
      ],
      health_check: 'POST /api/generate with test prompt returns 200',
    },
    meta: {
      version: '3.3',
      docs_url: 'https://ollama.ai/library/llama3.3',
      owner_agent: 'agent-001',
      changelog: ['Selected as primary reasoning model - beats 3.1 70B'],
    },
  },

  {
    identity: {
      name: 'Llama 3.1 8B',
      codename: 'LOCAL-FAST',
      id: 'tool-003',
      type: 'internal',
      status: 'offline',
      icon: 'zap',
    },
    role: {
      category: 'llm-model',
      purpose: 'Quick responses, chat, summaries',
      responsibilities: [
        'Fast conversational responses',
        'Text summarization',
        'Simple classification',
        'High-volume batch tasks',
      ],
      dependencies: ['tool-001'],
    },
    fallback: {
      backup_tools: ['tool-004', 'tool-007'], // Nemotron, then OpenAI
      failover_trigger: 'Model not loaded OR response time > 10s',
    },
    integration: {
      connects_to: ['BUNKER', 'n8n', 'LiteLLM'],
      exposed_via: 'internal',
      consumers: ['agent-001', 'agent-002', 'agent-003', 'agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: false,
      api_key_set: true,
      settings: {
        model_name: 'llama3.1:8b',
        context_length: 128000,
        parameters: '8B',
        vram_required: '6GB',
      },
    },
    kpis: {
      metrics: [
        { name: 'avg_response_time', target: 1500, unit: 'ms' },
        { name: 'throughput', target: 500, unit: 'requests/day' },
        { name: 'cost_per_task', target: 0, unit: 'USD' },
      ],
      health_check: 'POST /api/generate with test prompt returns 200',
    },
    meta: {
      version: '3.1',
      docs_url: 'https://ollama.ai/library/llama3.1',
      owner_agent: 'agent-001',
      changelog: ['Selected for fast tasks - better reasoning than 3.2'],
    },
  },

  {
    identity: {
      name: 'Nemotron 3 Nano',
      codename: 'LOCAL-AGENTIC',
      id: 'tool-004',
      type: 'internal',
      status: 'offline',
      icon: 'workflow',
    },
    role: {
      category: 'llm-model',
      purpose: 'Function calling, tool execution, agentic tasks',
      responsibilities: [
        'Function/tool calling',
        'Agentic task execution',
        'Structured output generation',
        'Multi-step workflows',
      ],
      dependencies: ['tool-001'],
    },
    fallback: {
      backup_tools: ['tool-003', 'tool-006'],
      failover_trigger: 'Model not loaded OR function call fails',
    },
    integration: {
      connects_to: ['BUNKER', 'n8n', 'LiteLLM'],
      exposed_via: 'internal',
      consumers: ['agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: false,
      api_key_set: true,
      settings: {
        model_name: 'nemotron-3-nano',
        context_length: 1000000, // 1M context!
        parameters: '30B (3.5B active)',
        architecture: 'MoE',
        vram_required: '2GB',
      },
    },
    kpis: {
      metrics: [
        { name: 'avg_response_time', target: 1000, unit: 'ms' },
        { name: 'function_call_accuracy', target: 95, unit: '%' },
        { name: 'throughput', target: 1000, unit: 'requests/day' },
      ],
      health_check: 'POST /api/generate with tool call returns 200',
    },
    meta: {
      version: '3.0',
      docs_url: 'https://ollama.ai/library/nemotron-3-nano',
      owner_agent: 'agent-001',
      changelog: ['Added for agentic/tool-use tasks - 3.3x faster than competitors'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // ORCHESTRATION LAYER
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'LiteLLM Proxy',
      codename: 'ORCHESTRATION-ROUTER',
      id: 'tool-005',
      type: 'internal',
      status: 'offline',
      icon: 'workflow',
    },
    role: {
      category: 'automation',
      purpose: 'Unified API, load balancing, fallback routing',
      responsibilities: [
        'Route requests to optimal model',
        'Handle fallbacks when local models fail',
        'Load balance across providers',
        'Unified API interface',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'N/A - is the fallback router itself',
    },
    integration: {
      connects_to: ['Ollama', 'Claude API', 'OpenAI', 'Gemini', 'Perplexity'],
      exposed_via: 'api',
      consumers: ['BUNKER', 'n8n', 'All Agents'],
    },
    config: {
      enabled: true,
      api_key_required: false,
      api_key_set: true,
      endpoint: 'http://localhost:4000',
    },
    kpis: {
      metrics: [
        { name: 'routing_success_rate', target: 99.9, unit: '%' },
        { name: 'avg_routing_latency', target: 50, unit: 'ms' },
        { name: 'fallback_triggers_per_day', target: 10, unit: 'count' },
      ],
      health_check: 'GET /health returns 200',
    },
    meta: {
      version: 'latest',
      docs_url: 'https://docs.litellm.ai',
      owner_agent: 'agent-001',
      changelog: ['Added as model router - routes 70B to Claude until GPU upgrade'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // CLOUD AI - FALLBACKS & SPECIALIZED TASKS
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'Claude API',
      codename: 'CLOUD-CLAUDE',
      id: 'tool-006',
      type: 'internal',
      status: 'offline',
      icon: 'cloud',
    },
    role: {
      category: 'cloud-api',
      purpose: 'Complex reasoning fallback, code generation',
      responsibilities: [
        'Fallback for Llama 3.3 70B',
        'Complex multi-step reasoning',
        'Code generation and review',
        'Long document analysis',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: ['tool-007'],
      failover_trigger: 'API returns 5xx OR rate limited',
    },
    integration: {
      connects_to: ['BUNKER', 'n8n', 'LiteLLM'],
      exposed_via: 'api',
      consumers: ['agent-001', 'agent-002', 'agent-003'],
    },
    config: {
      enabled: false,
      api_key_required: true,
      api_key_set: false,
      endpoint: 'https://api.anthropic.com/v1',
      settings: {
        models: ['claude-opus-4', 'claude-sonnet-4'],
        pricing: 'Usage-based',
      },
    },
    kpis: {
      metrics: [
        { name: 'avg_response_time', target: 5000, unit: 'ms' },
        { name: 'monthly_cost', target: 50, unit: 'USD' },
        { name: 'uptime', target: 99.9, unit: '%' },
      ],
      health_check: 'GET /v1/models returns 200',
    },
    meta: {
      version: 'claude-opus-4',
      docs_url: 'https://docs.anthropic.com',
      owner_agent: 'agent-001',
      changelog: ['Primary cloud fallback for heavy reasoning'],
    },
  },

  {
    identity: {
      name: 'OpenAI API',
      codename: 'CLOUD-OPENAI',
      id: 'tool-007',
      type: 'internal',
      status: 'offline',
      icon: 'cloud',
    },
    role: {
      category: 'cloud-api',
      purpose: 'GPT-4o for multimodal, embeddings',
      responsibilities: [
        'Multimodal tasks (vision)',
        'Text embeddings generation',
        'Function calling',
        'Backup reasoning',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: ['tool-008'],
      failover_trigger: 'API returns 5xx OR rate limited',
    },
    integration: {
      connects_to: ['BUNKER', 'n8n', 'LiteLLM'],
      exposed_via: 'api',
      consumers: ['agent-001', 'agent-002'],
    },
    config: {
      enabled: false,
      api_key_required: true,
      api_key_set: false,
      endpoint: 'https://api.openai.com/v1',
      settings: {
        models: ['gpt-4o', 'gpt-4o-mini', 'text-embedding-3-small'],
        pricing: 'Usage-based',
      },
    },
    kpis: {
      metrics: [
        { name: 'avg_response_time', target: 3000, unit: 'ms' },
        { name: 'monthly_cost', target: 30, unit: 'USD' },
        { name: 'uptime', target: 99.9, unit: '%' },
      ],
      health_check: 'GET /v1/models returns 200',
    },
    meta: {
      version: 'gpt-4o',
      docs_url: 'https://platform.openai.com/docs',
      owner_agent: 'agent-001',
      changelog: ['Added for multimodal and embeddings'],
    },
  },

  {
    identity: {
      name: 'Gemini API',
      codename: 'CLOUD-GEMINI',
      id: 'tool-008',
      type: 'internal',
      status: 'offline',
      icon: 'cloud',
    },
    role: {
      category: 'cloud-api',
      purpose: 'Long context tasks (1M+ tokens)',
      responsibilities: [
        'Very long context processing',
        'Large document analysis',
        'Multimodal tasks',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: ['tool-006'],
      failover_trigger: 'API returns 5xx OR rate limited',
    },
    integration: {
      connects_to: ['BUNKER', 'n8n', 'LiteLLM'],
      exposed_via: 'api',
      consumers: ['agent-001', 'agent-003'],
    },
    config: {
      enabled: false,
      api_key_required: true,
      api_key_set: false,
      endpoint: 'https://generativelanguage.googleapis.com/v1',
      settings: {
        models: ['gemini-pro', 'gemini-pro-vision'],
        pricing: 'Usage-based',
      },
    },
    kpis: {
      metrics: [
        { name: 'avg_response_time', target: 4000, unit: 'ms' },
        { name: 'monthly_cost', target: 20, unit: 'USD' },
        { name: 'max_context', target: 1000000, unit: 'tokens' },
      ],
      health_check: 'GET /models returns 200',
    },
    meta: {
      version: 'gemini-pro',
      docs_url: 'https://ai.google.dev/docs',
      owner_agent: 'agent-001',
      changelog: ['Added for 1M+ context tasks'],
    },
  },

  {
    identity: {
      name: 'Perplexity API',
      codename: 'CLOUD-PERPLEXITY',
      id: 'tool-009',
      type: 'internal',
      status: 'offline',
      icon: 'search',
    },
    role: {
      category: 'cloud-api',
      purpose: 'Real-time web search, citations',
      responsibilities: [
        'Real-time web search',
        'Current events research',
        'Fact-checking with sources',
        'Citation generation',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: ['tool-006'],
      failover_trigger: 'API returns 5xx OR rate limited',
    },
    integration: {
      connects_to: ['BUNKER', 'n8n', 'LiteLLM'],
      exposed_via: 'api',
      consumers: ['agent-003'],
    },
    config: {
      enabled: false,
      api_key_required: true,
      api_key_set: false,
      endpoint: 'https://api.perplexity.ai',
      settings: {
        models: ['pplx-70b-online', 'pplx-7b-online'],
        pricing: 'Usage-based',
      },
    },
    kpis: {
      metrics: [
        { name: 'avg_response_time', target: 5000, unit: 'ms' },
        { name: 'sources_per_response', target: 5, unit: 'count' },
        { name: 'accuracy', target: 95, unit: '%' },
      ],
      health_check: 'POST /chat/completions returns 200',
    },
    meta: {
      version: 'pplx-70b-online',
      docs_url: 'https://docs.perplexity.ai',
      owner_agent: 'agent-001',
      changelog: ['Added for search-augmented research'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // AUTOMATION & ORCHESTRATION
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'n8n Pro',
      codename: 'AUTOMATION-HUB',
      id: 'tool-010',
      type: 'internal',
      status: 'offline',
      icon: 'workflow',
    },
    role: {
      category: 'automation',
      purpose: 'Visual workflow automation, integrations',
      responsibilities: [
        'Connect external services and APIs',
        'Visual workflow builder',
        'Webhook handling',
        'Scheduled automations',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: ['tool-011'],
      failover_trigger: 'Instance unreachable for 5 minutes',
    },
    integration: {
      connects_to: ['All Cloud APIs', 'Apollo', 'Hunter.io', 'BUNKER'],
      exposed_via: 'webhook',
      consumers: ['agent-001', 'agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      endpoint: '',
      settings: {
        plan: 'Pro',
        monthly_cost: '$50',
      },
    },
    kpis: {
      metrics: [
        { name: 'workflow_success_rate', target: 99, unit: '%' },
        { name: 'avg_execution_time', target: 5000, unit: 'ms' },
        { name: 'active_workflows', target: 20, unit: 'count' },
      ],
      health_check: 'GET /healthz returns 200',
    },
    meta: {
      version: 'Pro',
      docs_url: 'https://docs.n8n.io',
      owner_agent: 'agent-004',
      changelog: ['Primary automation hub - $50/mo'],
    },
  },

  {
    identity: {
      name: 'Trigger.dev',
      codename: 'AUTOMATION-JOBS',
      id: 'tool-011',
      type: 'internal',
      status: 'offline',
      icon: 'workflow',
    },
    role: {
      category: 'automation',
      purpose: 'Code-first background jobs, cron, queues',
      responsibilities: [
        'Background job processing',
        'Cron scheduling',
        'Queue management',
        'Long-running tasks',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: ['tool-010'],
      failover_trigger: 'Job fails 3 times',
    },
    integration: {
      connects_to: ['BUNKER', 'Vercel'],
      exposed_via: 'api',
      consumers: ['agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Hobby (Free)',
      },
    },
    kpis: {
      metrics: [
        { name: 'job_success_rate', target: 99, unit: '%' },
        { name: 'avg_job_duration', target: 30000, unit: 'ms' },
      ],
      health_check: 'Dashboard shows healthy status',
    },
    meta: {
      version: 'latest',
      docs_url: 'https://trigger.dev/docs',
      owner_agent: 'agent-004',
      changelog: ['Added for code-first background jobs'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // OBSERVABILITY
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'Langfuse',
      codename: 'OBSERVABILITY-AI',
      id: 'tool-012',
      type: 'internal',
      status: 'offline',
      icon: 'monitoring',
    },
    role: {
      category: 'monitoring',
      purpose: 'AI traces, cost tracking, prompt management',
      responsibilities: [
        'LLM request tracing',
        'Cost tracking per model',
        'Prompt versioning',
        'Performance analytics',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'N/A - observability is non-blocking',
    },
    integration: {
      connects_to: ['LiteLLM', 'All LLM APIs'],
      exposed_via: 'api',
      consumers: ['agent-001'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Cloud (Free)',
      },
    },
    kpis: {
      metrics: [
        { name: 'trace_capture_rate', target: 100, unit: '%' },
        { name: 'dashboard_uptime', target: 99.9, unit: '%' },
      ],
      health_check: 'Dashboard accessible',
    },
    meta: {
      version: 'Cloud',
      docs_url: 'https://langfuse.com/docs',
      owner_agent: 'agent-001',
      changelog: ['Added for AI observability'],
    },
  },

  {
    identity: {
      name: 'Upstash Redis',
      codename: 'CACHE-LAYER',
      id: 'tool-013',
      type: 'internal',
      status: 'offline',
      icon: 'database',
    },
    role: {
      category: 'database',
      purpose: 'Response caching, rate limits, session state',
      responsibilities: [
        'Cache LLM responses',
        'Rate limiting',
        'Session state storage',
        'Pub/sub messaging',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'Connection timeout > 5s',
    },
    integration: {
      connects_to: ['BUNKER', 'LiteLLM', 'n8n'],
      exposed_via: 'api',
      consumers: ['agent-001', 'agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: '$10/mo',
      },
    },
    kpis: {
      metrics: [
        { name: 'cache_hit_rate', target: 80, unit: '%' },
        { name: 'avg_latency', target: 10, unit: 'ms' },
      ],
      health_check: 'PING returns PONG',
    },
    meta: {
      version: 'Serverless',
      docs_url: 'https://upstash.com/docs/redis',
      owner_agent: 'agent-001',
      changelog: ['Added for caching and rate limiting - $10/mo'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // DATA ENRICHMENT
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'Apollo Pro API',
      codename: 'DATA-APOLLO',
      id: 'tool-014',
      type: 'internal',
      status: 'offline',
      icon: 'users',
    },
    role: {
      category: 'data-enrichment',
      purpose: 'B2B lead data, company info',
      responsibilities: [
        'Contact enrichment',
        'Company data lookup',
        'Lead scoring data',
        'Email verification',
      ],
      dependencies: ['tool-010'],
    },
    fallback: {
      backup_tools: ['tool-015'],
      failover_trigger: 'API rate limit exceeded',
    },
    integration: {
      connects_to: ['n8n'],
      exposed_via: 'api',
      consumers: ['agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Pro',
        monthly_cost: '$99',
      },
    },
    kpis: {
      metrics: [
        { name: 'enrichment_success_rate', target: 85, unit: '%' },
        { name: 'avg_response_time', target: 2000, unit: 'ms' },
      ],
      health_check: 'GET /api/v1/auth/health returns 200',
    },
    meta: {
      version: 'v1',
      docs_url: 'https://apolloio.github.io/apollo-api-docs',
      owner_agent: 'agent-004',
      changelog: ['Primary B2B data source - $99/mo'],
    },
  },

  {
    identity: {
      name: 'Hunter.io',
      codename: 'DATA-HUNTER',
      id: 'tool-015',
      type: 'internal',
      status: 'offline',
      icon: 'users',
    },
    role: {
      category: 'data-enrichment',
      purpose: 'Email verification, domain search',
      responsibilities: [
        'Email verification',
        'Domain email search',
        'Email finder',
        'Deliverability check',
      ],
      dependencies: ['tool-010'],
    },
    fallback: {
      backup_tools: ['tool-014'],
      failover_trigger: 'API rate limit exceeded',
    },
    integration: {
      connects_to: ['n8n'],
      exposed_via: 'api',
      consumers: ['agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Starter',
        monthly_cost: '$49',
      },
    },
    kpis: {
      metrics: [
        { name: 'verification_accuracy', target: 95, unit: '%' },
        { name: 'avg_response_time', target: 1000, unit: 'ms' },
      ],
      health_check: 'GET /v2/account returns 200',
    },
    meta: {
      version: 'v2',
      docs_url: 'https://hunter.io/api-documentation',
      owner_agent: 'agent-004',
      changelog: ['Added for email verification - $49/mo'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // DATABASE INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'Neon Postgres',
      codename: 'DATABASE-PRIMARY',
      id: 'tool-016',
      type: 'internal',
      status: 'offline',
      icon: 'database',
    },
    role: {
      category: 'database',
      purpose: 'Primary production database',
      responsibilities: [
        'Primary data storage',
        'ACID transactions',
        'Branching for dev/staging',
        'Auto-scaling',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'Connection fails 3 times',
    },
    integration: {
      connects_to: ['BUNKER', 'Vercel', 'n8n'],
      exposed_via: 'internal',
      consumers: ['All Agents'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Launch',
        monthly_cost: '$19',
      },
    },
    kpis: {
      metrics: [
        { name: 'uptime', target: 99.95, unit: '%' },
        { name: 'avg_query_time', target: 50, unit: 'ms' },
      ],
      health_check: 'SELECT 1 returns result',
    },
    meta: {
      version: 'Serverless Postgres',
      docs_url: 'https://neon.tech/docs',
      owner_agent: 'agent-001',
      changelog: ['Primary production database - $19/mo'],
    },
  },

  {
    identity: {
      name: 'Qdrant',
      codename: 'DATABASE-VECTOR',
      id: 'tool-017',
      type: 'internal',
      status: 'offline',
      icon: 'database',
    },
    role: {
      category: 'database',
      purpose: 'Embeddings, semantic search, RAG',
      responsibilities: [
        'Vector storage',
        'Semantic search',
        'RAG retrieval',
        'Similarity matching',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'Connection fails',
    },
    integration: {
      connects_to: ['BUNKER', 'OpenAI Embeddings'],
      exposed_via: 'api',
      consumers: ['agent-003'],
    },
    config: {
      enabled: true,
      api_key_required: false,
      api_key_set: true,
      endpoint: 'http://localhost:6333',
      settings: {
        plan: 'Free (Self-hosted)',
      },
    },
    kpis: {
      metrics: [
        { name: 'search_latency', target: 100, unit: 'ms' },
        { name: 'index_size', target: 1000000, unit: 'vectors' },
      ],
      health_check: 'GET /health returns 200',
    },
    meta: {
      version: 'latest',
      docs_url: 'https://qdrant.tech/documentation',
      owner_agent: 'agent-001',
      changelog: ['Added for RAG and semantic search'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // DOCUMENT & BRAND
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'Gamma.app API',
      codename: 'CONTENT-GAMMA',
      id: 'tool-018',
      type: 'internal',
      status: 'offline',
      icon: 'document',
    },
    role: {
      category: 'automation',
      purpose: 'AI-generated presentations, decks',
      responsibilities: [
        'Generate slide decks',
        'Create presentations',
        'Document formatting',
      ],
      dependencies: ['tool-010'],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'API fails',
    },
    integration: {
      connects_to: ['n8n'],
      exposed_via: 'api',
      consumers: ['agent-004'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Plus',
        monthly_cost: '$10',
      },
    },
    kpis: {
      metrics: [
        { name: 'generation_success_rate', target: 95, unit: '%' },
      ],
      health_check: 'API accessible',
    },
    meta: {
      version: 'latest',
      docs_url: 'https://gamma.app',
      owner_agent: 'agent-004',
      changelog: ['Added for presentation generation - $10/mo'],
    },
  },

  {
    identity: {
      name: 'Canva Business MCP',
      codename: 'CONTENT-CANVA',
      id: 'tool-019',
      type: 'internal',
      status: 'offline',
      icon: 'document',
    },
    role: {
      category: 'automation',
      purpose: 'Brand assets, social graphics',
      responsibilities: [
        'Create branded graphics',
        'Social media assets',
        'Brand consistency',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'N/A',
    },
    integration: {
      connects_to: ['BUNKER via MCP'],
      exposed_via: 'mcp',
      consumers: ['agent-001'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Business',
        monthly_cost: '$13',
      },
    },
    kpis: {
      metrics: [
        { name: 'assets_created', target: 50, unit: 'per month' },
      ],
      health_check: 'MCP connection active',
    },
    meta: {
      version: 'Business',
      docs_url: 'https://www.canva.com/developers',
      owner_agent: 'agent-001',
      changelog: ['Added for brand assets - $13/mo'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // AUTH & SECURITY
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'Clerk',
      codename: 'AUTH-CLERK',
      id: 'tool-020',
      type: 'internal',
      status: 'offline',
      icon: 'security',
    },
    role: {
      category: 'database',
      purpose: 'User auth, org management, SSO',
      responsibilities: [
        'User authentication',
        'Organization management',
        'SSO integration',
        'Session management',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'Auth fails',
    },
    integration: {
      connects_to: ['Next.js', 'BUNKER'],
      exposed_via: 'api',
      consumers: ['All Apps'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Pro',
        monthly_cost: '$25',
      },
    },
    kpis: {
      metrics: [
        { name: 'auth_success_rate', target: 99.9, unit: '%' },
        { name: 'avg_auth_time', target: 500, unit: 'ms' },
      ],
      health_check: 'API returns 200',
    },
    meta: {
      version: 'latest',
      docs_url: 'https://clerk.com/docs',
      owner_agent: 'agent-001',
      changelog: ['Primary auth provider - $25/mo'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // DEPLOYMENT & MONITORING
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'Vercel Pro',
      codename: 'DEPLOY-VERCEL',
      id: 'tool-021',
      type: 'internal',
      status: 'offline',
      icon: 'cloud',
    },
    role: {
      category: 'automation',
      purpose: 'Frontend hosting, edge functions, preview deploys',
      responsibilities: [
        'Next.js hosting',
        'Edge function execution',
        'Preview deployments',
        'CDN distribution',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'Deploy fails',
    },
    integration: {
      connects_to: ['GitHub', 'Neon'],
      exposed_via: 'internal',
      consumers: ['All Apps'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Pro',
        monthly_cost: '$20',
      },
    },
    kpis: {
      metrics: [
        { name: 'deploy_success_rate', target: 99, unit: '%' },
        { name: 'avg_build_time', target: 60, unit: 'seconds' },
      ],
      health_check: 'Dashboard accessible',
    },
    meta: {
      version: 'Pro',
      docs_url: 'https://vercel.com/docs',
      owner_agent: 'agent-001',
      changelog: ['Primary deployment platform - $20/mo'],
    },
  },

  {
    identity: {
      name: 'Sentry',
      codename: 'MONITOR-SENTRY',
      id: 'tool-022',
      type: 'internal',
      status: 'offline',
      icon: 'monitoring',
    },
    role: {
      category: 'monitoring',
      purpose: 'Error tracking, performance monitoring',
      responsibilities: [
        'Error tracking',
        'Performance monitoring',
        'Release tracking',
        'Alerting',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'N/A - monitoring is non-blocking',
    },
    integration: {
      connects_to: ['Next.js', 'Vercel'],
      exposed_via: 'api',
      consumers: ['All Apps'],
    },
    config: {
      enabled: true,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Team',
        monthly_cost: '$26',
      },
    },
    kpis: {
      metrics: [
        { name: 'error_capture_rate', target: 100, unit: '%' },
        { name: 'alert_response_time', target: 60, unit: 'seconds' },
      ],
      health_check: 'Dashboard accessible',
    },
    meta: {
      version: 'Team',
      docs_url: 'https://docs.sentry.io',
      owner_agent: 'agent-001',
      changelog: ['Error and performance monitoring - $26/mo'],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // REMAINING GAPS (from doc)
  // ═══════════════════════════════════════════════════════════════

  {
    identity: {
      name: 'Cloudflare R2',
      codename: 'STORAGE-R2',
      id: 'tool-023',
      type: 'internal',
      status: 'offline',
      icon: 'storage',
    },
    role: {
      category: 'database',
      purpose: 'Object storage for docs, images, PDFs',
      responsibilities: [
        'File storage',
        'Image hosting',
        'Document storage',
        'Xactimate exports',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'Upload fails',
    },
    integration: {
      connects_to: ['BUNKER', 'n8n', 'Vercel'],
      exposed_via: 'api',
      consumers: ['All Apps'],
    },
    config: {
      enabled: false,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Pay-as-you-go',
        monthly_cost: '~$5',
      },
    },
    kpis: {
      metrics: [
        { name: 'upload_success_rate', target: 99.9, unit: '%' },
        { name: 'avg_latency', target: 100, unit: 'ms' },
      ],
      health_check: 'Bucket accessible',
    },
    meta: {
      version: 'R2',
      docs_url: 'https://developers.cloudflare.com/r2',
      owner_agent: 'agent-001',
      changelog: ['GAP: Needed for contractor doc uploads'],
    },
  },

  {
    identity: {
      name: 'Infisical',
      codename: 'SECRETS-INFISICAL',
      id: 'tool-024',
      type: 'internal',
      status: 'offline',
      icon: 'security',
    },
    role: {
      category: 'database',
      purpose: 'API keys, env vars across environments',
      responsibilities: [
        'Secret management',
        'Environment variables',
        'Key rotation',
        'Access control',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'Secret fetch fails',
    },
    integration: {
      connects_to: ['All Apps', 'Vercel', 'n8n'],
      exposed_via: 'api',
      consumers: ['All Agents'],
    },
    config: {
      enabled: false,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Free',
      },
    },
    kpis: {
      metrics: [
        { name: 'secret_fetch_latency', target: 100, unit: 'ms' },
      ],
      health_check: 'API accessible',
    },
    meta: {
      version: 'Cloud',
      docs_url: 'https://infisical.com/docs',
      owner_agent: 'agent-001',
      changelog: ['GAP: Needed for centralized secrets'],
    },
  },

  {
    identity: {
      name: 'BetterStack',
      codename: 'MONITOR-UPTIME',
      id: 'tool-025',
      type: 'internal',
      status: 'offline',
      icon: 'monitoring',
    },
    role: {
      category: 'monitoring',
      purpose: 'Uptime monitor, status pages, alerting',
      responsibilities: [
        'Uptime monitoring',
        'Status pages',
        'Incident alerting',
        'On-call scheduling',
      ],
      dependencies: [],
    },
    fallback: {
      backup_tools: [],
      failover_trigger: 'N/A',
    },
    integration: {
      connects_to: ['All services'],
      exposed_via: 'internal',
      consumers: ['agent-001'],
    },
    config: {
      enabled: false,
      api_key_required: true,
      api_key_set: false,
      settings: {
        plan: 'Starter',
        monthly_cost: '$24',
      },
    },
    kpis: {
      metrics: [
        { name: 'check_frequency', target: 30, unit: 'seconds' },
        { name: 'alert_latency', target: 60, unit: 'seconds' },
      ],
      health_check: 'Dashboard accessible',
    },
    meta: {
      version: 'Starter',
      docs_url: 'https://betterstack.com/docs',
      owner_agent: 'agent-001',
      changelog: ['GAP: Needed for uptime monitoring - $24/mo'],
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.identity.id === id);
}

export function getToolByCodename(codename: string): Tool | undefined {
  return tools.find((t) => t.identity.codename === codename);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.role.category === category);
}

export function getOnlineTools(): Tool[] {
  return tools.filter((t) => t.identity.status === 'online');
}

export function getEnabledTools(): Tool[] {
  return tools.filter((t) => t.config.enabled);
}

export function getCloudAPIs(): Tool[] {
  return tools.filter((t) => t.role.category === 'cloud-api');
}

export function getLocalModels(): Tool[] {
  return tools.filter((t) => t.role.category === 'llm-model');
}

export function getToolsNeedingAPIKey(): Tool[] {
  return tools.filter((t) => t.config.api_key_required && !t.config.api_key_set);
}

// Monthly cost calculation
export function getMonthlyToolCosts(): { category: string; total: number }[] {
  const costs: Record<string, number> = {};

  tools.forEach((tool) => {
    const costStr = tool.config.settings?.monthly_cost as string;
    if (costStr) {
      const cost = parseFloat(costStr.replace(/[^0-9.]/g, '')) || 0;
      const cat = tool.role.category;
      costs[cat] = (costs[cat] || 0) + cost;
    }
  });

  return Object.entries(costs).map(([category, total]) => ({ category, total }));
}
