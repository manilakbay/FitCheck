import { Croissant, Egg, Flame, Wheat } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatGrams, formatKcal } from "@/lib/format";
import type { MacroTotals } from "@/types/models";

export function DailyNutritionSummary({
  totals,
  targets,
}: {
  totals: MacroTotals;
  targets?: { calories: number; protein: number; carbs: number; fat: number } | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard
        label="Calories"
        value={formatKcal(totals.calories)}
        hint={targets ? `of ${formatKcal(targets.calories)}` : undefined}
        icon={Flame}
        tone="brand"
      />
      <StatCard
        label="Protein"
        value={formatGrams(totals.protein_g)}
        hint={targets ? `of ${formatGrams(targets.protein)}` : undefined}
        icon={Egg}
        tone="accent"
      />
      <StatCard
        label="Carbs"
        value={formatGrams(totals.carbs_g)}
        hint={targets ? `of ${formatGrams(targets.carbs)}` : undefined}
        icon={Wheat}
        tone="warn"
      />
      <StatCard
        label="Fat"
        value={formatGrams(totals.fat_g)}
        hint={targets ? `of ${formatGrams(targets.fat)}` : undefined}
        icon={Croissant}
        tone="slate"
      />
    </div>
  );
}
