import { format, parseISO } from "date-fns";

import { ActivityRing } from "@/components/ui/activity-ring";
import { formatKcal } from "@/lib/format";
import { Greeting } from "@/features/dashboard/greeting";

export interface HeroCardProps {
  displayName: string;
  today: string;
  caloriesIn: number;
  caloriesOut: number;
  calorieTarget: number | null;
  proteinIn: number;
  proteinTarget: number | null;
  activityMinutes: number;
  activityMinutesTarget: number;
}

const CALORIE_COLOR = "#38bdf8";
const PROTEIN_COLOR = "#22c55e";
const ACTIVITY_COLOR = "#f59e0b";

export function HeroCard({
  displayName,
  today,
  caloriesIn,
  caloriesOut,
  calorieTarget,
  proteinIn,
  proteinTarget,
  activityMinutes,
  activityMinutesTarget,
}: HeroCardProps) {
  const net = caloriesIn - caloriesOut;
  const overTarget = calorieTarget != null && net > calorieTarget;
  const underByCalories =
    calorieTarget != null ? Math.max(calorieTarget - net, 0) : null;
  const overByCalories =
    calorieTarget != null ? Math.max(net - calorieTarget, 0) : null;

  const dateLabel = format(parseISO(today), "EEEE · MMM d");

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-6 text-white shadow-lg sm:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {dateLabel}
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            <Greeting name={displayName} />
          </h1>
          <p className="max-w-md text-sm text-slate-300">
            Here&apos;s where today stands. Close the rings to hit your daily nutrition
            and activity targets.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <ActivityRing
            size={172}
            strokeWidth={13}
            gap={4}
            rings={[
              {
                value: caloriesIn,
                target: calorieTarget && calorieTarget > 0 ? calorieTarget : 2000,
                color: CALORIE_COLOR,
                label: "Calories",
              },
              {
                value: proteinIn,
                target: proteinTarget && proteinTarget > 0 ? proteinTarget : 100,
                color: PROTEIN_COLOR,
                label: "Protein",
              },
              {
                value: activityMinutes,
                target: activityMinutesTarget > 0 ? activityMinutesTarget : 30,
                color: ACTIVITY_COLOR,
                label: "Activity",
              },
            ]}
          >
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-300">
              Consumed
            </span>
            <span className="text-2xl font-semibold">{Math.round(caloriesIn).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">kcal</span>
          </ActivityRing>

          <dl className="grid w-full max-w-[220px] grid-cols-3 gap-2 text-center sm:grid-cols-1 sm:text-left">
            <RingLegendItem color={CALORIE_COLOR} label="Calories" value={formatKcal(caloriesIn)} />
            <RingLegendItem
              color={PROTEIN_COLOR}
              label="Protein"
              value={`${Math.round(proteinIn)} g`}
            />
            <RingLegendItem
              color={ACTIVITY_COLOR}
              label="Activity"
              value={`${activityMinutes} min`}
            />
          </dl>
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
        <HeroStat label="Consumed" value={formatKcal(caloriesIn)} />
        <HeroStat label="Burned" value={formatKcal(caloriesOut)} tone="positive" />
        <HeroStat
          label={overTarget ? "Over target" : "Under target"}
          value={
            calorieTarget == null
              ? "—"
              : overTarget
                ? `+${formatKcal(overByCalories ?? 0)}`
                : `−${formatKcal(underByCalories ?? 0)}`
          }
          tone={overTarget ? "negative" : "positive"}
        />
      </div>
    </section>
  );
}

function RingLegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:items-center sm:gap-2">
      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="text-sm font-semibold text-white sm:text-sm">{value}</span>
    </div>
  );
}

function HeroStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-accent-500"
      : tone === "negative"
        ? "text-amber-400"
        : "text-white";
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-3">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className={`text-base font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}
