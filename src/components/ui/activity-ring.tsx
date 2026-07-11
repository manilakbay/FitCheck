import * as React from "react";

import { cn, clamp } from "@/lib/utils";

export interface RingInput {
  value: number;
  target: number;
  color: string;
  label?: string;
}

export interface ActivityRingProps {
  rings: readonly [RingInput, RingInput, RingInput];
  size?: number;
  strokeWidth?: number;
  gap?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Apple-Fitness-style triple ring rendered in pure SVG (no client bundle).
 * Each concentric arc represents value/target for one metric and overshoots
 * are clamped to 105% so the visual maxes out gracefully.
 */
export function ActivityRing({
  rings,
  size = 180,
  strokeWidth = 14,
  gap = 4,
  className,
  children,
}: ActivityRingProps) {
  const center = size / 2;
  const outerRadius = center - strokeWidth / 2;
  const radii = [
    outerRadius,
    outerRadius - (strokeWidth + gap),
    outerRadius - 2 * (strokeWidth + gap),
  ];

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {rings.map((ring, i) => {
          const r = radii[i] ?? 0;
          if (r <= 0) return null;
          const circumference = 2 * Math.PI * r;
          const pct = ring.target > 0 ? clamp(ring.value / ring.target, 0, 1.05) : 0;
          const filled = pct * circumference;
          return (
            <g key={i}>
              <circle
                cx={center}
                cy={center}
                r={r}
                stroke={ring.color}
                strokeOpacity={0.18}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={center}
                cy={center}
                r={r}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${filled} ${circumference - filled}`}
              />
            </g>
          );
        })}
      </svg>
      {children ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
