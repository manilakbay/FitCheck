"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDayLabel } from "@/lib/dates";

export interface CaloriesBurnedPoint {
  date: string;
  calories: number;
}

export function CaloriesBurnedChart({ data }: { data: CaloriesBurnedPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="caloriesBurnedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickFormatter={formatDayLabel}
          tickMargin={8}
        />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={40} />
        <Tooltip
          labelFormatter={(value: string) => formatDayLabel(value)}
          formatter={(value) => [`${Math.round(Number(value))} kcal`, "Burned"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="calories"
          stroke="#16a34a"
          strokeWidth={2}
          fill="url(#caloriesBurnedFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
