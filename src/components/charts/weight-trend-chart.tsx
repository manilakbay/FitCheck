"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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
      <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
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
        <Line
          type="monotone"
          dataKey="weight_kg"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
