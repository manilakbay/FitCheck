import Link from "next/link";
import {
  Bike,
  Coffee,
  Cookie,
  Dumbbell,
  Footprints,
  Salad,
  Sandwich,
  Sparkles,
  Utensils,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeDay } from "@/lib/dates";
import { formatKcal, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActivityEntry, FoodEntry } from "@/types/models";

function AiDot({ title }: { title: string }) {
  return (
    <span
      title={title}
      aria-label={title}
      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 text-brand-700"
    >
      <Sparkles className="h-2.5 w-2.5" aria-hidden />
    </span>
  );
}

const MEAL_ICONS: Record<FoodEntry["meal_type"], { icon: LucideIcon; tone: string }> = {
  breakfast: { icon: Coffee, tone: "bg-amber-100 text-amber-700" },
  lunch: { icon: Sandwich, tone: "bg-brand-100 text-brand-700" },
  dinner: { icon: Utensils, tone: "bg-indigo-100 text-indigo-700" },
  snack: { icon: Cookie, tone: "bg-pink-100 text-pink-700" },
};

const MEAL_LABELS: Record<FoodEntry["meal_type"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const ACTIVITY_ICONS: Record<ActivityEntry["activity_type"], { icon: LucideIcon; tone: string }> = {
  walking: { icon: Footprints, tone: "bg-brand-100 text-brand-700" },
  running: { icon: Zap, tone: "bg-accent-500/10 text-accent-700" },
  swimming: { icon: Waves, tone: "bg-sky-100 text-sky-700" },
  cycling: { icon: Bike, tone: "bg-emerald-100 text-emerald-700" },
  weight_training: { icon: Dumbbell, tone: "bg-slate-200 text-slate-700" },
  other: { icon: Salad, tone: "bg-slate-100 text-slate-600" },
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
        <Link
          className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
          href="/nutrition"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState
            title="No meals yet"
            description="Add your first meal to start tracking macros."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => {
              const meta = MEAL_ICONS[entry.meal_type];
              const Icon = meta.icon;
              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      meta.tone,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {entry.food_name}
                      </span>
                      {entry.source === "ai" ? (
                        <AiDot title="Estimated by AI" />
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {MEAL_LABELS[entry.meal_type]} · {relativeDay(entry.entry_date)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatKcal(Number(entry.calories))}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {Math.round(Number(entry.protein_g))}g P
                    </div>
                  </div>
                </li>
              );
            })}
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
        <Link
          className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
          href="/activity"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState
            title="No activities yet"
            description="Log workouts to see calories burned and duration."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => {
              const meta = ACTIVITY_ICONS[entry.activity_type];
              const Icon = meta.icon;
              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      meta.tone,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {ACTIVITY_LABELS[entry.activity_type]}
                      </span>
                      {entry.source === "ai" ? (
                        <AiDot title="Estimated by AI" />
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {relativeDay(entry.entry_date)} · {formatMinutes(entry.duration_min)}
                      {entry.distance_km != null
                        ? ` · ${Number(entry.distance_km).toFixed(1)} km`
                        : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-sm font-semibold text-slate-900">
                    {formatKcal(Number(entry.calories_burned))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
