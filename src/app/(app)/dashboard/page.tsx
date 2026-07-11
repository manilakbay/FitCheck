import Link from "next/link";
import { Activity, Flame, Scale, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { ChartShell } from "@/components/charts/chart-shell";
import { CalorieIntakeChart } from "@/components/charts/calorie-intake-chart";
import { CaloriesBurnedChart } from "@/components/charts/calories-burned-chart";
import { ProteinTrendChart } from "@/components/charts/protein-trend-chart";
import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { MacroProgress } from "@/features/dashboard/macro-progress";
import { RecentActivities, RecentMeals } from "@/features/dashboard/recent-lists";
import { loadDashboardData, sumFoodTotals } from "@/features/dashboard/queries";
import { requireUser } from "@/lib/supabase/auth";
import { formatKcal, formatKg, formatNumber } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await loadDashboardData(user.id);

  const totals = sumFoodTotals(data.todaysFood);
  const todaysBurn = data.todaysActivity.reduce(
    (sum, entry) => sum + Number(entry.calories_burned),
    0,
  );
  const net = totals.calories - todaysBurn;
  const goalTarget = data.goal ? Number(data.goal.calorie_target) : null;
  const proteinTarget = data.goal ? Number(data.goal.protein_target_g) : null;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your daily nutrition and activity at a glance."
        actions={
          <>
            <Link href="/nutrition/new">
              <Button size="sm">Add meal</Button>
            </Link>
            <Link href="/activity/new">
              <Button size="sm" variant="secondary">
                Add activity
              </Button>
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Calories consumed"
          value={formatKcal(totals.calories)}
          hint={goalTarget ? `Target ${formatKcal(goalTarget)}` : "Set a target in your profile"}
          icon={Flame}
          tone="brand"
        />
        <StatCard
          label="Calories burned"
          value={formatKcal(todaysBurn)}
          hint={`${data.todaysActivity.length} activit${
            data.todaysActivity.length === 1 ? "y" : "ies"
          } today`}
          icon={Activity}
          tone="accent"
        />
        <StatCard
          label="Net calories"
          value={formatKcal(net)}
          hint={
            goalTarget
              ? net < goalTarget
                ? `Under target by ${formatKcal(goalTarget - net)}`
                : `Over target by ${formatKcal(net - goalTarget)}`
              : "Log meals & activity to see progress"
          }
          icon={Target}
          tone={goalTarget && net > goalTarget ? "warn" : "slate"}
        />
        <StatCard
          label="Current weight"
          value={
            data.latestWeight
              ? formatKg(Number(data.latestWeight.weight_kg))
              : data.profile?.weight_kg
                ? formatKg(Number(data.profile.weight_kg))
                : "—"
          }
          hint={
            data.goal?.goal_weight_kg
              ? `Goal ${formatKg(Number(data.goal.goal_weight_kg))}`
              : "Set a goal weight in your profile"
          }
          icon={Scale}
          tone="slate"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MacroProgress totals={totals} goal={data.goal} />
        </div>
        <StatCard
          label="14-day protein avg"
          value={
            formatNumber(
              data.proteinSeries.reduce((sum, p) => sum + p.protein_g, 0) /
                Math.max(data.proteinSeries.length, 1),
            ) + " g"
          }
          hint={proteinTarget ? `Target ${Math.round(proteinTarget)} g` : undefined}
          icon={TrendingUp}
          tone="accent"
          className="h-full"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartShell title="Daily calorie intake" description="Last 14 days">
          <CalorieIntakeChart data={data.caloriesInSeries} target={goalTarget} />
        </ChartShell>
        <ChartShell title="Daily calories burned" description="Last 14 days">
          <CaloriesBurnedChart data={data.caloriesOutSeries} />
        </ChartShell>
        <ChartShell title="Weight trend" description="Last 14 days">
          <WeightTrendChart data={data.weightSeries} />
        </ChartShell>
        <ChartShell title="Protein intake" description="Last 14 days">
          <ProteinTrendChart data={data.proteinSeries} target={proteinTarget} />
        </ChartShell>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentMeals entries={data.recentFood} />
        <RecentActivities entries={data.recentActivity} />
      </section>
    </>
  );
}
