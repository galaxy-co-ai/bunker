// ═══════════════════════════════════════════════════════════════
// BUNKER - Circular Gauge Component
// Industrial-style circular progress indicator
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';

interface CircularGaugeProps {
  value: number;
  max: number;
  label: string;
  size?: number;
  showPercentage?: boolean;
}

export function CircularGauge({
  value,
  max,
  label,
  size = 100,
  showPercentage = false
}: CircularGaugeProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on usage
  const getColor = () => {
    if (percentage >= 90) return '#ff0000';
    if (percentage >= 70) return '#ff6600';
    if (percentage >= 50) return '#ffaa00';
    return '#00ff00';
  };

  const color = getColor();
  const glowColor = color + '80';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />

        {/* Tick marks */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = size / 2 + (radius - 4) * Math.cos(angle);
          const y1 = size / 2 + (radius - 4) * Math.sin(angle);
          const x2 = size / 2 + (radius + 2) * Math.cos(angle);
          const y2 = size / 2 + (radius + 2) * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="metric-text text-lg font-bold"
          style={{ color }}
        >
          {showPercentage ? `${Math.round(percentage)}%` : `${value}GB`}
        </span>
        <span className="text-text-muted text-xs mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}
