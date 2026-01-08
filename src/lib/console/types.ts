// ═══════════════════════════════════════════════════════════════
// BUNKER - Console TypeScript Interfaces
// ═══════════════════════════════════════════════════════════════

export interface SystemInfo {
  os_name: string;
  os_version: string;
  hostname: string;
  cpu_count: number;
  cpu_brand: string;
  total_memory: number; // MB
  kernel_version: string;
}

export interface DiskInfo {
  name: string;
  mount_point: string;
  total_space: number; // GB
  available_space: number; // GB
  used_space: number; // GB
  usage_percent: number;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_used: number; // MB
  memory_total: number; // MB
  memory_percent: number;
  disks: DiskInfo[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  memory_mb: number;
  status: string;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code: number | null;
}

export interface TerminalLine {
  id: string;
  timestamp: Date;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

export interface TerminalHistory {
  commands: string[];
  currentIndex: number;
}

// PTY Types
export interface PtyResult {
  success: boolean;
  message: string;
}

export interface PtyOutput {
  data: string;
}

// PTY Signal Types
export type PtySignal = 'Interrupt' | 'EOF' | 'Suspend';

// Operations Log Types
export interface Operation {
  id: string;
  timestamp: string; // ISO date string
  operation_type: string;
  target: string;
  status: string;
  details: string | null;
  duration_ms: number | null;
}
