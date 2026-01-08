// ═══════════════════════════════════════════════════════════════
// BUNKER - Console Panel
// Main console page with system monitoring, terminal, and logs
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { SystemMonitor } from './SystemMonitor';
import { TerminalSection } from './TerminalSection';
import { ProcessList } from './ProcessList';
import { EnvironmentInfo } from './EnvironmentInfo';
import { ConsoleOperationsLog } from './ConsoleOperationsLog';

// Separator styling
const separatorH = "w-2 cursor-col-resize flex items-center justify-center hover:bg-vault-yellow/20 transition-colors";
const separatorV = "h-2 cursor-row-resize flex items-center justify-center hover:bg-vault-yellow/20 transition-colors";

export function ConsolePanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      {/* Main Layout */}
      <Group orientation="horizontal" className="flex-1">
        {/* Left Column - System Monitor + Processes */}
        <Panel defaultSize="20" minSize="10" maxSize="35">
          <div className="h-full p-1">
            <Group orientation="vertical" className="h-full">
              {/* System Monitor */}
              <Panel defaultSize="50" minSize="20">
                <div className="h-full pb-1">
                  <SystemMonitor />
                </div>
              </Panel>

              <Separator className={separatorV}>
                <div className="h-0.5 w-8 bg-vault-yellow/30 hover:bg-vault-yellow/60 transition-colors rounded-full" />
              </Separator>

              {/* Process List */}
              <Panel defaultSize="50" minSize="20">
                <div className="h-full pt-1">
                  <ProcessList />
                </div>
              </Panel>
            </Group>
          </div>
        </Panel>

        <Separator className={separatorH}>
          <div className="w-0.5 h-8 bg-vault-yellow/30 hover:bg-vault-yellow/60 transition-colors rounded-full" />
        </Separator>

        {/* Center - Terminal (main focus) */}
        <Panel defaultSize="55" minSize="30">
          <div className="h-full p-1">
            <TerminalSection />
          </div>
        </Panel>

        <Separator className={separatorH}>
          <div className="w-0.5 h-8 bg-vault-yellow/30 hover:bg-vault-yellow/60 transition-colors rounded-full" />
        </Separator>

        {/* Right Column - Environment + Operations Log */}
        <Panel defaultSize="25" minSize="15" maxSize="40">
          <div className="h-full p-1">
            <Group orientation="vertical" className="h-full">
              {/* Environment Info */}
              <Panel defaultSize="40" minSize="20">
                <div className="h-full pb-1">
                  <EnvironmentInfo />
                </div>
              </Panel>

              <Separator className={separatorV}>
                <div className="h-0.5 w-8 bg-vault-yellow/30 hover:bg-vault-yellow/60 transition-colors rounded-full" />
              </Separator>

              {/* Operations Log */}
              <Panel defaultSize="60" minSize="20">
                <div className="h-full pt-1">
                  <ConsoleOperationsLog />
                </div>
              </Panel>
            </Group>
          </div>
        </Panel>
      </Group>
    </motion.div>
  );
}
