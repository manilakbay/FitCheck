"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export interface MacroDonutSlice {
  key: string;
  label: string;
  grams: number;
  kcal: number;
  color: string;
}

export function MacroDonut({
  slices,
  size = 160,
}: {
  slices: MacroDonutSlice[];
  size?: number;
}) {
  const totalKcal = slices.reduce((sum, slice) => sum + slice.kcal, 0);
  const hasData = totalKcal > 0;

  const data = hasData
    ? slices.map((slice) => ({ name: slice.label, value: slice.kcal, color: slice.color }))
    : [{ name: "Empty", value: 1, color: "#e2e8f0" }];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={size * 0.36}
            outerRadius={size * 0.5}
            paddingAngle={hasData ? 2 : 0}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Intake
        </span>
        <span className="text-lg font-semibold text-slate-900">
          {Math.round(totalKcal).toLocaleString()}
        </span>
        <span className="text-[10px] text-slate-500">kcal</span>
      </div>
    </div>
  );
}
