// ═══════════════════════════════════════════════════════════════
// BUNKER - Mock Data for Phase 1
// ═══════════════════════════════════════════════════════════════

import type {
  ModelStatus,
  QueueTask,
  Operation,
  CostMetrics,
  TaskFlowNode,
  TaskFlowEdge
} from './types';

export const mockModels: ModelStatus[] = [
  {
    id: 'llama-8b',
    name: 'LLAMA 8B',
    status: 'idle',
    ramUsage: 0,
    ramCapacity: 32,
    temperature: 45,
    uptime: '7D 12H 34M',
    tasksToday: 142,
    avgResponseTime: 850,
  },
  {
    id: 'nemotron-30b',
    name: 'NEMOTRON 30B',
    status: 'active',
    ramUsage: 20,
    ramCapacity: 32,
    temperature: 67,
    uptime: '7D 12H 34M',
    tasksToday: 374,
    avgResponseTime: 2100,
  },
  {
    id: 'llama-70b',
    name: 'LLAMA 70B',
    status: 'swapped',
    ramUsage: 0,
    ramCapacity: 32,
    temperature: 42,
    uptime: '7D 12H 34M',
    tasksToday: 89,
    avgResponseTime: 3500,
  },
  {
    id: 'claude',
    name: 'CLAUDE API',
    status: 'active',
    ramUsage: 0,
    ramCapacity: 0,
    temperature: 0,
    uptime: '---',
    tasksToday: 23,
    avgResponseTime: 1200,
  },
];

export const mockQueueTasks: QueueTask[] = [
  {
    id: 'task-001',
    timestamp: new Date(Date.now() - 10000),
    type: 'LEAD_SCORING',
    status: 'running',
    model: 'NEMOTRON_30B',
    progress: 87,
    duration: 2100,
    estimatedTime: 3000,
  },
  {
    id: 'task-002',
    timestamp: new Date(Date.now() - 5000),
    type: 'CONTACT_ENRICH',
    status: 'queued',
    model: null,
    progress: 0,
    duration: 0,
    estimatedTime: 2500,
  },
  {
    id: 'task-003',
    timestamp: new Date(Date.now() - 15000),
    type: 'PIPELINE_DIGEST',
    status: 'success',
    model: 'LLAMA_8B',
    progress: 100,
    duration: 850,
    estimatedTime: 1000,
  },
  {
    id: 'task-004',
    timestamp: new Date(Date.now() - 20000),
    type: 'COMPETITOR_SCAN',
    status: 'success',
    model: 'CLAUDE_API',
    progress: 100,
    duration: 1200,
    estimatedTime: 1500,
  },
  {
    id: 'task-005',
    timestamp: new Date(Date.now() - 2000),
    type: 'EMAIL_DRAFT',
    status: 'queued',
    model: null,
    progress: 0,
    duration: 0,
    estimatedTime: 800,
  },
];

export const mockOperations: Operation[] = [
  {
    id: 'op-001',
    timestamp: new Date(Date.now() - 10000),
    name: 'LEAD_SCORING',
    status: 'running',
    model: 'NEMOTRON_30B',
    duration: 2100,
    logs: [
      '[12:34:56.001] >>> INITIALIZING TASK QUEUE',
      '[12:34:56.023] >>> ROUTING TO NEMOTRON_30B_CORE',
      '[12:34:56.145] >>> LOADING CONTACT DATA FROM VAULT_DB',
      '[12:34:56.289] >>> ESTABLISHING APOLLO_API_CONNECTION',
      '[12:34:56.445] >>> TRANSMITTING QUERY...',
      '[12:34:56.678] >>> APOLLO_API RESPONDED [200_OK]',
      '[12:34:56.890] >>> ANALYZING WITH NEMOTRON_30B...',
    ],
  },
  {
    id: 'op-002',
    timestamp: new Date(Date.now() - 5000),
    name: 'CONTACT_ENRICH',
    status: 'queued',
    model: null,
    duration: null,
  },
  {
    id: 'op-003',
    timestamp: new Date(Date.now() - 15000),
    name: 'PIPELINE_DIGEST',
    status: 'success',
    model: 'LLAMA_8B',
    duration: 850,
    logs: [
      '[12:34:52.001] >>> FETCHING PIPELINE DATA...',
      '[12:34:52.234] >>> ANALYZING TRENDS...',
      '[12:34:52.567] >>> GENERATING SUMMARY...',
      '[12:34:52.789] >>> COMPLETE',
    ],
    output: {
      summary: 'Pipeline performance up 12% this week',
      metrics: { deals: 45, value: 125000 },
    },
  },
  {
    id: 'op-004',
    timestamp: new Date(Date.now() - 25000),
    name: 'RESEARCH_QUERY',
    status: 'success',
    model: 'CLAUDE_API',
    duration: 1450,
    logs: [
      '[12:34:45.001] >>> INITIALIZING RESEARCH MODULE',
      '[12:34:45.234] >>> QUERYING CLAUDE_SONNET_4',
      '[12:34:46.567] >>> PROCESSING RESPONSE...',
      '[12:34:46.789] >>> COMPLETE',
    ],
  },
  {
    id: 'op-005',
    timestamp: new Date(Date.now() - 35000),
    name: 'BATCH_CLASSIFY',
    status: 'success',
    model: 'LLAMA_8B',
    duration: 2340,
  },
  {
    id: 'op-006',
    timestamp: new Date(Date.now() - 45000),
    name: 'DATA_SYNC',
    status: 'failed',
    model: 'NEMOTRON_30B',
    duration: 5600,
    logs: [
      '[12:34:30.001] >>> INITIATING DATA SYNC',
      '[12:34:30.234] >>> CONNECTION TIMEOUT',
      '[12:34:35.567] >>> RETRY ATTEMPT 1/3',
      '[12:34:35.789] >>> FAILED: VAULT_DB_UNREACHABLE',
    ],
  },
];

export const mockCostMetrics: CostMetrics = {
  today: 0.47,
  todayVsCloud: 94,
  savedToday: 12.03,
  week: 3.21,
  weekVsCloud: 92,
  month: 13.87,
  monthVsCloud: 89,
  totalSaved: 177.43,
};

export const mockFlowNodes: TaskFlowNode[] = [
  { id: 'input', label: 'INPUT', status: 'active', workloadPercent: 0, x: 300, y: 40 },
  { id: 'router', label: 'ROUTER', status: 'active', workloadPercent: 0, x: 300, y: 140 },
  { id: 'llama-8b', label: 'LLAMA 8B', status: 'idle', workloadPercent: 20, x: 80, y: 280 },
  { id: 'nemotron-30b', label: 'NEMOTRON 30B', status: 'active', workloadPercent: 60, x: 230, y: 280 },
  { id: 'llama-70b', label: 'LLAMA 70B', status: 'idle', workloadPercent: 15, x: 380, y: 280 },
  { id: 'claude', label: 'CLOUD API', status: 'idle', workloadPercent: 5, x: 530, y: 280 },
  { id: 'output', label: 'OUTPUT', status: 'active', workloadPercent: 0, x: 300, y: 420 },
];

export const mockFlowEdges: TaskFlowEdge[] = [
  { from: 'input', to: 'router', active: true },
  { from: 'router', to: 'llama-8b', active: false },
  { from: 'router', to: 'nemotron-30b', active: true },
  { from: 'router', to: 'llama-70b', active: false },
  { from: 'router', to: 'claude', active: false },
  { from: 'llama-8b', to: 'output', active: false },
  { from: 'nemotron-30b', to: 'output', active: true },
  { from: 'llama-70b', to: 'output', active: false },
  { from: 'claude', to: 'output', active: false },
];
