// ═══════════════════════════════════════════════════════════════
// BUNKER - Task Flow Diagram
// Center panel with node graph visualization
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import type { TaskFlowProps, TaskFlowNode } from '../../lib/types';

export function TaskFlow({ nodes, edges }: TaskFlowProps) {
  // Find node positions for edge drawing
  const getNodePos = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden relative">
      {/* CRT Scanlines overlay */}
      <div className="crt-scanlines absolute inset-0 pointer-events-none z-50" />

      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-border-warning/50 bg-metal-rust/50 relative z-10">
        <h2 className="heading-text text-sm flex items-center gap-2">
          <motion.span
            className="text-terminal-green"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ◉
          </motion.span>
          TASK FLOW MONITOR
          <span className="text-text-muted text-xs ml-auto">
            REAL-TIME
          </span>
        </h2>
      </div>

      {/* Flow Diagram */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 600 480"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid pattern */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,170,0,0.1)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Active edge gradient */}
            <linearGradient id="activeEdge" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff00" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00ff00" stopOpacity="1" />
              <stop offset="100%" stopColor="#00ff00" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Draw edges */}
          {edges.map((edge, i) => {
            const from = getNodePos(edge.from);
            const to = getNodePos(edge.to);

            return (
              <g key={i}>
                {/* Edge line */}
                <motion.line
                  x1={from.x + 50}
                  y1={from.y + 30}
                  x2={to.x + 50}
                  y2={to.y}
                  stroke={edge.active ? 'url(#activeEdge)' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={edge.active ? 3 : 1}
                  filter={edge.active ? 'url(#glow)' : ''}
                />

                {/* Animated particle on active edges */}
                {edge.active && (
                  <motion.circle
                    r="4"
                    fill="#00ff00"
                    filter="url(#glow)"
                    initial={{ x: from.x + 50, y: from.y + 30 }}
                    animate={{
                      x: [from.x + 50, to.x + 50],
                      y: [from.y + 30, to.y],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node, i) => (
            <FlowNode key={node.id} node={node} index={i} />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-border-warning/30 bg-concrete-dark/50 flex gap-4 text-[10px]">
        <LegendItem color="bg-safe" label="ACTIVE" />
        <LegendItem color="bg-text-muted" label="IDLE" />
        <LegendItem color="bg-caution" label="PROCESSING" />
      </div>
    </div>
  );
}

function FlowNode({ node, index }: { node: TaskFlowNode; index: number }) {
  const isSpecialNode = node.id === 'input' || node.id === 'output' || node.id === 'router';
  const nodeWidth = isSpecialNode ? 80 : 100;
  const nodeHeight = isSpecialNode ? 40 : 60;

  const statusColor = {
    active: '#00ff00',
    idle: '#888888',
    processing: '#ffaa00',
  }[node.status];

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Node background */}
      <rect
        x={node.x + (100 - nodeWidth) / 2}
        y={node.y}
        width={nodeWidth}
        height={nodeHeight}
        rx="4"
        fill={isSpecialNode ? '#2d2520' : '#1a1a1a'}
        stroke={statusColor}
        strokeWidth={node.status === 'active' ? 2 : 1}
        filter={node.status === 'active' ? 'url(#glow)' : ''}
      />

      {/* Router hazard symbol */}
      {node.id === 'router' && (
        <text
          x={node.x + 50}
          y={node.y + 14}
          textAnchor="middle"
          fill="#f4d03f"
          fontSize="12"
        >
          ⚠
        </text>
      )}

      {/* Node label */}
      <text
        x={node.x + 50}
        y={isSpecialNode ? node.y + 26 : node.y + 20}
        textAnchor="middle"
        fill="#f4d03f"
        fontSize="10"
        fontFamily="Rajdhani"
        fontWeight="bold"
      >
        {node.label}
      </text>

      {/* Workload bar for model nodes */}
      {!isSpecialNode && node.workloadPercent > 0 && (
        <>
          {/* Bar background */}
          <rect
            x={node.x + 20}
            y={node.y + 32}
            width={60}
            height={8}
            fill="#1a1a1a"
            stroke="#333"
            strokeWidth="1"
          />
          {/* Bar fill */}
          <motion.rect
            x={node.x + 21}
            y={node.y + 33}
            width={0}
            height={6}
            fill={node.status === 'active' ? '#00ff00' : '#888888'}
            animate={{ width: (node.workloadPercent / 100) * 58 }}
            transition={{ duration: 0.5 }}
          />
          {/* Percentage text */}
          <text
            x={node.x + 50}
            y={node.y + 52}
            textAnchor="middle"
            fill="#ff9933"
            fontSize="9"
            fontFamily="Share Tech Mono"
          >
            {node.workloadPercent}%
          </text>
        </>
      )}
    </motion.g>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-text-muted">{label}</span>
    </div>
  );
}
