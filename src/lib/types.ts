// ═══════════════════════════════════════════════════════════════
// BUNKER - TypeScript Interfaces
// ═══════════════════════════════════════════════════════════════

export interface ModelStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'swapped' | 'offline';
  ramUsage: number;      // GB
  ramCapacity: number;   // GB
  temperature: number;   // Celsius
  uptime: string;
  tasksToday: number;
  avgResponseTime: number; // milliseconds
}

export interface QueueTask {
  id: string;
  timestamp: Date;
  type: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  model: string | null;
  progress: number; // 0-100
  duration: number; // ms
  estimatedTime: number; // ms
}

export interface Operation {
  id: string;
  timestamp: Date;
  name: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  model: string | null;
  duration: number | null; // ms
  logs?: string[];
  output?: Record<string, unknown>;
}

export interface CostMetrics {
  today: number;
  todayVsCloud: number; // percentage saved
  savedToday: number;
  week: number;
  weekVsCloud: number;
  month: number;
  monthVsCloud: number;
  totalSaved: number;
}

export interface TaskFlowNode {
  id: string;
  label: string;
  status: 'active' | 'idle' | 'processing';
  workloadPercent: number;
  x: number;
  y: number;
}

export interface TaskFlowEdge {
  from: string;
  to: string;
  active: boolean;
}

export interface Particle {
  id: string;
  type: 'classification' | 'scoring' | 'enrichment' | 'research';
  position: { x: number; y: number };
  targetNode: string;
}

export interface HeaderProps {
  overseerName: string;
  vaultNumber: string;
  uptime: string;
  radiationLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  temperature: number;
}

export interface SystemHealthProps {
  models: ModelStatus[];
  totalRam: number;
  totalRamUsed: number;
  cpuUsage: number;
}

export interface TaskFlowProps {
  nodes: TaskFlowNode[];
  edges: TaskFlowEdge[];
  activeParticles: Particle[];
}

export interface LiveQueueProps {
  tasks: QueueTask[];
  onViewDetails: (taskId: string) => void;
  onCancel: (taskId: string) => void;
}

export interface OperationsLogProps {
  operations: Operation[];
  onExport: () => void;
  onClear: () => void;
}

export interface CostTrackerProps {
  metrics: CostMetrics;
}
