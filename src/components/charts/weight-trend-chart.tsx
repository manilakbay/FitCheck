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

export interface WeightSeriesPoint {
  date: string;
  weight_kg: number | null;
}

export function WeightTrendChart({ data }: { data: WeightSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="weightTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickFormatter={formatDayLabel}
          tickMargin={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          domain={["auto", "auto"]}
          allowDecimals
          width={40}
        />
        <Tooltip
          labelFormatter={(value: string) => formatDayLabel(value)}
          formatter={(value) => {
            const numeric = typeof value === "number" ? value : Number(value);
            return Number.isFinite(numeric)
              ? [`${numeric.toFixed(1)} kg`, "Weight"]
              : ["—", "Weight"];
          }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="weight_kg"
          stroke="#0ea5e9"
          strokeWidth={2}
          fill="url(#weightTrendFill)"
          connectNulls
          isAnimationActive={false}
          dot={{ r: 3, fill: "#0ea5e9" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
