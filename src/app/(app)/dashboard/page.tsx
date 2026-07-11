import { ChartShell } from "@/components/charts/chart-shell";
import { CalorieIntakeChart } from "@/components/charts/calorie-intake-chart";
import { CaloriesBurnedChart } from "@/components/charts/calories-burned-chart";
import { ProteinTrendChart } from "@/components/charts/protein-trend-chart";
import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { HeroCard } from "@/features/dashboard/hero-card";
import { MacroBreakdown } from "@/features/dashboard/macro-breakdown";
import { QuickActions } from "@/features/dashboard/quick-actions";
import { RecentActivities, RecentMeals } from "@/features/dashboard/recent-lists";
import { SummaryStrip } from "@/features/dashboard/summary-strip";
import { WeeklyMomentum } from "@/features/dashboard/weekly-momentum";
import { loadDashboardData, sumFoodTotals } from "@/features/dashboard/queries";
import { requireUser } from "@/lib/supabase/auth";
import { formatKg } from "@/lib/format";

export const metadata = { title: "Dashboard" };

function extractDisplayName(fullName: string | null | undefined, email: string | undefined) {
  if (fullName && fullName.trim().length > 0) {
    const first = fullName.trim().split(/\s+/)[0];
    if (first) return first;
  }
  if (email) {
    const local = email.split("@")[0] ?? "";
    if (local.length > 0) return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "friend";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await loadDashboardData(user.id);

  const totals = sumFoodTotals(data.todaysFood);
  const todaysBurn = data.todaysActivity.reduce(
    (sum, entry) => sum + Number(entry.calories_burned),
    0,
  );
  const todaysMinutes = data.todaysActivity.reduce(
    (sum, entry) => sum + Number(entry.duration_min),
    0,
  );
  const net = totals.calories - todaysBurn;

  const goalTarget = data.goal ? Number(data.goal.calorie_target) : null;
  const proteinTarget = data.goal ? Number(data.goal.protein_target_g) : null;

  const yesterdayIndex = data.caloriesInSeries.length - 2;
  const yesterdayCaloriesIn =
    yesterdayIndex >= 0 ? data.caloriesInSeries[yesterdayIndex]?.calories ?? 0 : 0;
  const yesterdayCaloriesOut =
    yesterdayIndex >= 0 ? data.caloriesOutSeries[yesterdayIndex]?.calories ?? 0 : 0;

  const displayName = extractDisplayName(data.profile?.full_name, user.email ?? undefined);

  const weightPointsRecorded = data.weightSeries.filter((p) => p.weight_kg != null).length;
  const latestWeightKg = data.latestWeight
    ? Number(data.latestWeight.weight_kg)
    : data.profile?.weight_kg
      ? Number(data.profile.weight_kg)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <HeroCard
        displayName={displayName}
        today={data.today}
        caloriesIn={totals.calories}
        caloriesOut={todaysBurn}
        calorieTarget={goalTarget}
        proteinIn={totals.protein_g}
        proteinTarget={proteinTarget}
        activityMinutes={todaysMinutes}
        activityMinutesTarget={30}
      />

      <QuickActions />

      <SummaryStrip
        caloriesIn={totals.calories}
        caloriesOut={todaysBurn}
        net={net}
        calorieTarget={goalTarget}
        yesterdayCaloriesIn={yesterdayCaloriesIn}
        yesterdayCaloriesOut={yesterdayCaloriesOut}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MacroBreakdown totals={totals} goal={data.goal} />
        </div>
        <WeeklyMomentum
          caloriesInSeries={data.caloriesInSeries}
          caloriesOutSeries={data.caloriesOutSeries}
          calorieTarget={goalTarget}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartShell
          title="Daily calorie intake"
          description="Last 14 days"
          emptyMessage={
            data.caloriesInSeries.every((p) => p.calories === 0)
              ? "Log meals to see your intake trend."
              : null
          }
        >
          <CalorieIntakeChart data={data.caloriesInSeries} target={goalTarget} />
        </ChartShell>
        <ChartShell
          title="Daily calories burned"
          description="Last 14 days"
          emptyMessage={
            data.caloriesOutSeries.every((p) => p.calories === 0)
              ? "Log workouts to see your burn trend."
              : null
          }
        >
          <CaloriesBurnedChart data={data.caloriesOutSeries} />
        </ChartShell>
        <ChartShell
          title="Weight trend"
          description="Last 14 days"
          headline={latestWeightKg != null ? formatKg(latestWeightKg) : "—"}
          emptyMessage={
            weightPointsRecorded < 2
              ? weightPointsRecorded === 1
                ? "Log another weight entry to see your trend."
                : "Add your weight to start tracking your trend."
              : null
          }
        >
          <WeightTrendChart data={data.weightSeries} />
        </ChartShell>
        <ChartShell
          title="Protein intake"
          description="Last 14 days"
          emptyMessage={
            data.proteinSeries.every((p) => p.protein_g === 0)
              ? "Log meals to see your protein trend."
              : null
          }
        >
          <ProteinTrendChart data={data.proteinSeries} target={proteinTarget} />
        </ChartShell>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentMeals entries={data.recentFood} />
        <RecentActivities entries={data.recentActivity} />
      </section>
    </div>
  );
}
