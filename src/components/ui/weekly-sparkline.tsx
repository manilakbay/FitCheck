"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { formatDayLabel } from "@/lib/dates";

export interface WeeklySparklinePoint {
  date: string;
  in: number;
  out: number;
}

/**
 * Compact seven-day comparison: two thin bars per day, calories in
 * (brand) and calories out (accent). Height stays small so it can sit
 * inside a card next to a headline number.
 */
export function WeeklySparkline({ data }: { data: WeeklySparklinePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={92}>
      <BarChart data={data} barCategoryGap="24%" barGap={2} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickFormatter={(iso) => formatDayLabel(iso).split(" ")[1] ?? ""}
          tickMargin={4}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
          labelFormatter={(value: string) => formatDayLabel(value)}
          formatter={(value, name) => {
            const numeric = typeof value === "number" ? value : Number(value);
            const label = name === "in" ? "Consumed" : "Burned";
            return [`${Math.round(numeric)} kcal`, label];
          }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Bar dataKey="in" fill="#38bdf8" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="out" fill="#22c55e" radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
