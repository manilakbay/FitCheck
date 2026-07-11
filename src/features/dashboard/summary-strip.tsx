import { Activity, ArrowDownRight, ArrowUpRight, Flame, Minus, Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatKcal } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface SummaryStripProps {
  caloriesIn: number;
  caloriesOut: number;
  net: number;
  calorieTarget: number | null;
  yesterdayCaloriesIn: number;
  yesterdayCaloriesOut: number;
}

export function SummaryStrip({
  caloriesIn,
  caloriesOut,
  net,
  calorieTarget,
  yesterdayCaloriesIn,
  yesterdayCaloriesOut,
}: SummaryStripProps) {
  const inDelta = caloriesIn - yesterdayCaloriesIn;
  const outDelta = caloriesOut - yesterdayCaloriesOut;

  let targetHint = "Set a target in your profile";
  let targetTone: "positive" | "warn" | "neutral" = "neutral";
  if (calorieTarget != null) {
    const diff = net - calorieTarget;
    if (Math.abs(diff) < 50) {
      targetHint = "On track";
      targetTone = "positive";
    } else if (diff > 0) {
      targetHint = `Over by ${formatKcal(diff)}`;
      targetTone = "warn";
    } else {
      targetHint = `Under by ${formatKcal(-diff)}`;
      targetTone = "positive";
    }
  }

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Consumed"
        value={formatKcal(caloriesIn)}
        icon={<Flame className="h-4 w-4" aria-hidden />}
        iconTone="brand"
        delta={{ value: inDelta, formatter: formatKcal, invertColors: true }}
      />
      <SummaryCard
        label="Burned"
        value={formatKcal(caloriesOut)}
        icon={<Activity className="h-4 w-4" aria-hidden />}
        iconTone="accent"
        delta={{ value: outDelta, formatter: formatKcal }}
      />
      <SummaryCard
        label="Vs target"
        value={
          calorieTarget != null
            ? net > calorieTarget
              ? `+${formatKcal(net - calorieTarget)}`
              : `−${formatKcal(calorieTarget - net)}`
            : "—"
        }
        icon={<Target className="h-4 w-4" aria-hidden />}
        iconTone={targetTone === "warn" ? "warn" : targetTone === "positive" ? "accent" : "slate"}
        hint={targetHint}
        hintTone={targetTone}
      />
    </section>
  );
}

interface DeltaSpec {
  value: number;
  formatter: (value: number) => string;
  /** When true, positive deltas are shown as "warm" (e.g. consumed more calories). */
  invertColors?: boolean;
}

function SummaryCard({
  label,
  value,
  icon,
  iconTone,
  delta,
  hint,
  hintTone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconTone: "brand" | "accent" | "warn" | "slate";
  delta?: DeltaSpec;
  hint?: string;
  hintTone?: "positive" | "warn" | "neutral";
}) {
  const iconBg =
    iconTone === "brand"
      ? "bg-brand-50 text-brand-600"
      : iconTone === "accent"
        ? "bg-accent-500/10 text-accent-600"
        : iconTone === "warn"
          ? "bg-amber-50 text-amber-600"
          : "bg-slate-100 text-slate-600";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {label}
          </span>
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", iconBg)}>
            {icon}
          </span>
        </div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
        {delta ? <DeltaChip spec={delta} /> : null}
        {hint ? (
          <span
            className={cn(
              "text-xs font-medium",
              hintTone === "positive" && "text-accent-600",
              hintTone === "warn" && "text-amber-600",
              (!hintTone || hintTone === "neutral") && "text-slate-500",
            )}
          >
            {hint}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DeltaChip({ spec }: { spec: DeltaSpec }) {
  const rounded = Math.round(spec.value);
  if (rounded === 0) {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
        <Minus className="h-3 w-3" aria-hidden /> No change
      </span>
    );
  }
  const positive = rounded > 0;
  const good = spec.invertColors ? !positive : positive;
  const tone = good
    ? "bg-accent-500/10 text-accent-700"
    : "bg-amber-100 text-amber-700";
  const arrow = positive ? (
    <ArrowUpRight className="h-3 w-3" aria-hidden />
  ) : (
    <ArrowDownRight className="h-3 w-3" aria-hidden />
  );
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone,
      )}
    >
      {arrow}
      {spec.formatter(Math.abs(rounded))} vs yesterday
    </span>
  );
}
