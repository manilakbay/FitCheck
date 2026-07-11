import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklySparkline } from "@/components/ui/weekly-sparkline";
import { formatKcal } from "@/lib/format";

export interface WeeklyMomentumProps {
  caloriesInSeries: { date: string; calories: number }[];
  caloriesOutSeries: { date: string; calories: number }[];
  calorieTarget: number | null;
}

export function WeeklyMomentum({
  caloriesInSeries,
  caloriesOutSeries,
  calorieTarget,
}: WeeklyMomentumProps) {
  const last7In = caloriesInSeries.slice(-7);
  const last7Out = caloriesOutSeries.slice(-7);

  const totalIn = last7In.reduce((sum, point) => sum + point.calories, 0);
  const totalOut = last7Out.reduce((sum, point) => sum + point.calories, 0);
  const daysWithFood = last7In.filter((point) => point.calories > 0).length;
  const avgIn = daysWithFood > 0 ? Math.round(totalIn / daysWithFood) : 0;
  const avgOut = last7Out.length > 0 ? Math.round(totalOut / last7Out.length) : 0;

  const data = last7In.map((entry, index) => ({
    date: entry.date,
    in: entry.calories,
    out: last7Out[index]?.calories ?? 0,
  }));

  let summary = "Log a few days to see your weekly trend.";
  if (daysWithFood > 0) {
    if (calorieTarget != null) {
      const diff = avgIn - calorieTarget;
      if (Math.abs(diff) < 100) {
        summary = `You're right on target — averaging ${formatKcal(avgIn)}/day.`;
      } else if (diff > 0) {
        summary = `Averaging ${formatKcal(avgIn)}/day — ${formatKcal(diff)} over target.`;
      } else {
        summary = `Averaging ${formatKcal(avgIn)}/day — ${formatKcal(-diff)} under target.`;
      }
    } else {
      summary = `Averaging ${formatKcal(avgIn)}/day this week.`;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Weekly momentum</CardTitle>
          <CardDescription>Last 7 days · consumed vs burned</CardDescription>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-slate-500">
          <LegendDot color="#38bdf8" label="In" />
          <LegendDot color="#22c55e" label="Out" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <WeeklySparkline data={data} />
        <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>{summary}</span>
          <span className="text-[11px] text-slate-500">
            Avg burn <span className="font-semibold text-slate-800">{formatKcal(avgOut)}</span>/day
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
