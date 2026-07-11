import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDayLabel } from "@/lib/dates";
import { formatKcal, formatMinutes } from "@/lib/format";
import type { ActivityEntry, FoodEntry } from "@/types/models";

const MEAL_LABELS: Record<FoodEntry["meal_type"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const ACTIVITY_LABELS: Record<ActivityEntry["activity_type"], string> = {
  walking: "Walking",
  running: "Running",
  swimming: "Swimming",
  cycling: "Cycling",
  weight_training: "Weight training",
  other: "Other",
};

export function RecentMeals({ entries }: { entries: FoodEntry[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent meals</CardTitle>
        <Link className="text-xs font-medium text-brand-600 hover:underline" href="/nutrition">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState title="No meals yet" description="Add your first meal to start tracking macros." />
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{entry.food_name}</span>
                    <Badge tone="slate">{MEAL_LABELS[entry.meal_type]}</Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {formatDayLabel(entry.entry_date)} · {formatKcal(Number(entry.calories))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentActivities({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent activities</CardTitle>
        <Link className="text-xs font-medium text-brand-600 hover:underline" href="/activity">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState
            title="No activities yet"
            description="Log workouts to see calories burned and duration."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">
                    {ACTIVITY_LABELS[entry.activity_type]}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {formatDayLabel(entry.entry_date)} · {formatMinutes(entry.duration_min)} ·{" "}
                    {formatKcal(Number(entry.calories_burned))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
