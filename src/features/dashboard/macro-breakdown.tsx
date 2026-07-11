import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MacroDonut } from "@/components/ui/macro-donut";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatGrams } from "@/lib/format";
import { clamp } from "@/lib/utils";
import type { DailyGoal, MacroTotals } from "@/types/models";

const KCAL_PER_G = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

const COLORS = {
  protein: "#22c55e",
  carbs: "#38bdf8",
  fat: "#f59e0b",
} as const;

export function MacroBreakdown({
  totals,
  goal,
}: {
  totals: MacroTotals;
  goal: DailyGoal | null;
}) {
  const proteinTarget = goal ? Number(goal.protein_target_g) : null;
  const carbsTarget = goal ? Number(goal.carbs_target_g) : null;
  const fatTarget = goal ? Number(goal.fat_target_g) : null;

  const slices = [
    {
      key: "protein",
      label: "Protein",
      grams: totals.protein_g,
      kcal: totals.protein_g * KCAL_PER_G.protein,
      color: COLORS.protein,
    },
    {
      key: "carbs",
      label: "Carbs",
      grams: totals.carbs_g,
      kcal: totals.carbs_g * KCAL_PER_G.carbs,
      color: COLORS.carbs,
    },
    {
      key: "fat",
      label: "Fat",
      grams: totals.fat_g,
      kcal: totals.fat_g * KCAL_PER_G.fat,
      color: COLORS.fat,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Macro breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="shrink-0">
          <MacroDonut slices={slices} size={168} />
        </div>
        <div className="flex w-full flex-col gap-4">
          <MacroBar
            label="Protein"
            color={COLORS.protein}
            value={totals.protein_g}
            target={proteinTarget}
            tone="accent"
          />
          <MacroBar
            label="Carbs"
            color={COLORS.carbs}
            value={totals.carbs_g}
            target={carbsTarget}
            tone="brand"
          />
          <MacroBar
            label="Fat"
            color={COLORS.fat}
            value={totals.fat_g}
            target={fatTarget}
            tone="warn"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MacroBar({
  label,
  color,
  value,
  target,
  tone,
}: {
  label: string;
  color: string;
  value: number;
  target: number | null;
  tone: "brand" | "accent" | "warn" | "danger";
}) {
  const remaining = target != null ? Math.max(target - value, 0) : null;
  const pct = target && target > 0 ? clamp((value / target) * 100, 0, 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="text-xs text-slate-500">
          <span className="font-semibold text-slate-900">{formatGrams(value)}</span>
          {target != null ? (
            <>
              {" "}
              /{" "}
              <span>{formatGrams(target)}</span>
            </>
          ) : null}
        </span>
      </div>
      <ProgressBar value={value} max={target ?? Math.max(value, 1)} tone={tone} />
      {target != null ? (
        <span className="text-[11px] text-slate-500">
          {remaining && remaining > 0
            ? `${formatGrams(remaining)} left · ${Math.round(pct)}%`
            : "Target reached"}
        </span>
      ) : null}
    </div>
  );
}
