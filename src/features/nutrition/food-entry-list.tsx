import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteFoodEntryAction } from "@/features/nutrition/actions";
import { formatDayLabel } from "@/lib/dates";
import { formatGrams, formatKcal, formatNumber } from "@/lib/format";
import type { FoodEntry } from "@/types/models";

const MEAL_LABELS: Record<FoodEntry["meal_type"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function FoodEntryGroup({
  date,
  entries,
}: {
  date: string;
  entries: FoodEntry[];
}) {
  const totals = entries.reduce(
    (acc, entry) => {
      acc.calories += Number(entry.calories) || 0;
      acc.protein += Number(entry.protein_g) || 0;
      acc.carbs += Number(entry.carbs_g) || 0;
      acc.fat += Number(entry.fat_g) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-1 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">{formatDayLabel(date)}</div>
          <div className="text-xs text-slate-500">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 text-xs">
          <Badge tone="brand">{formatKcal(totals.calories)}</Badge>
          <Badge tone="accent">{formatGrams(totals.protein)} P</Badge>
          <Badge tone="warn">{formatGrams(totals.carbs)} C</Badge>
          <Badge tone="slate">{formatGrams(totals.fat)} F</Badge>
        </div>
      </header>
      <ul className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{entry.food_name}</span>
                <Badge tone="slate">{MEAL_LABELS[entry.meal_type]}</Badge>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {formatNumber(Number(entry.quantity), 2)} {entry.unit} ·{" "}
                {formatKcal(Number(entry.calories))} · P {formatGrams(Number(entry.protein_g))} /
                C {formatGrams(Number(entry.carbs_g))} / F {formatGrams(Number(entry.fat_g))}
              </div>
            </div>
            <form action={deleteFoodEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                aria-label={`Delete ${entry.food_name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
