"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDayLabel } from "@/lib/dates";

export interface CalorieIntakePoint {
  date: string;
  calories: number;
}

export function CalorieIntakeChart({
  data,
  target,
}: {
  data: CalorieIntakePoint[];
  target?: number | null;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
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
          formatter={(value) => [`${Math.round(Number(value))} kcal`, "Calories"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        {target ? (
          <ReferenceLine
            y={target}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: "Target", position: "right", fill: "#b45309", fontSize: 10 }}
          />
        ) : null}
        <Bar dataKey="calories" fill="#38bdf8" radius={[6, 6, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
