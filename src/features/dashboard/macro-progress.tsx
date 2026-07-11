import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatGrams, formatKcal } from "@/lib/format";
import type { DailyGoal, MacroTotals } from "@/types/models";

export function MacroProgress({
  totals,
  goal,
}: {
  totals: MacroTotals;
  goal: DailyGoal | null;
}) {
  const calorieTarget = goal ? Number(goal.calorie_target) : null;
  const proteinTarget = goal ? Number(goal.protein_target_g) : null;
  const carbsTarget = goal ? Number(goal.carbs_target_g) : null;
  const fatTarget = goal ? Number(goal.fat_target_g) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s targets</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ProgressBar
          value={totals.calories}
          max={calorieTarget ?? 2000}
          tone="brand"
          label="Calories"
          suffix={`${formatKcal(totals.calories)}${
            calorieTarget ? ` / ${formatKcal(calorieTarget)}` : ""
          }`}
        />
        <ProgressBar
          value={totals.protein_g}
          max={proteinTarget ?? 100}
          tone="accent"
          label="Protein"
          suffix={`${formatGrams(totals.protein_g)}${
            proteinTarget ? ` / ${formatGrams(proteinTarget)}` : ""
          }`}
        />
        <ProgressBar
          value={totals.carbs_g}
          max={carbsTarget ?? 250}
          tone="warn"
          label="Carbs"
          suffix={`${formatGrams(totals.carbs_g)}${
            carbsTarget ? ` / ${formatGrams(carbsTarget)}` : ""
          }`}
        />
        <ProgressBar
          value={totals.fat_g}
          max={fatTarget ?? 70}
          tone="danger"
          label="Fat"
          suffix={`${formatGrams(totals.fat_g)}${
            fatTarget ? ` / ${formatGrams(fatTarget)}` : ""
          }`}
        />
      </CardContent>
    </Card>
  );
}
