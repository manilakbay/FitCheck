"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDayLabel } from "@/lib/dates";

export interface ProteinTrendPoint {
  date: string;
  protein_g: number;
}

export function ProteinTrendChart({
  data,
  target,
}: {
  data: ProteinTrendPoint[];
  target?: number | null;
}) {
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
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={40} />
        <Tooltip
          labelFormatter={(value: string) => formatDayLabel(value)}
          formatter={(value) => [`${Math.round(Number(value))} g`, "Protein"]}
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
        <Line
          type="monotone"
          dataKey="protein_g"
          stroke="#0284c7"
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
