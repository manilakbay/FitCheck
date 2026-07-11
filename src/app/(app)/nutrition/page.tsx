import Link from "next/link";
import { Plus, Salad } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { DailyNutritionSummary } from "@/features/nutrition/daily-summary";
import { FoodEntryGroup } from "@/features/nutrition/food-entry-list";
import { getProfileAndGoals } from "@/features/profile/queries";
import {
  getRecentFoodEntries,
  groupByDate,
  totalsForEntries,
} from "@/features/nutrition/queries";
import { requireUser } from "@/lib/supabase/auth";
import { todayIso } from "@/lib/dates";

export const metadata = { title: "Nutrition" };

export default async function NutritionPage() {
  const user = await requireUser();
  const [entries, { goal }] = await Promise.all([
    getRecentFoodEntries(user.id, 14),
    getProfileAndGoals(user.id),
  ]);

  const today = todayIso();
  const todaysEntries = entries.filter((entry) => entry.entry_date === today);
  const todaysTotals = totalsForEntries(todaysEntries);
  const grouped = Array.from(groupByDate(entries).entries()).sort(([a], [b]) =>
    a < b ? 1 : a > b ? -1 : 0,
  );

  const targets = goal
    ? {
        calories: Number(goal.calorie_target),
        protein: Number(goal.protein_target_g),
        carbs: Number(goal.carbs_target_g),
        fat: Number(goal.fat_target_g),
      }
    : null;

  return (
    <>
      <PageHeader
        title="Nutrition"
        description="Track calories and macros, one meal at a time."
        actions={
          <Link href="/nutrition/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden /> Add meal
            </Button>
          </Link>
        }
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Today
        </h2>
        <DailyNutritionSummary totals={todaysTotals} targets={targets} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent history
        </h2>
        {grouped.length === 0 ? (
          <EmptyState
            icon={Salad}
            title="No meals logged yet"
            description="Start tracking to build your daily calorie and macro totals."
            action={
              <Link href="/nutrition/new">
                <Button>
                  <Plus className="h-4 w-4" aria-hidden /> Add your first meal
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {grouped.map(([date, entries]) => (
              <FoodEntryGroup key={date} date={date} entries={entries} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
