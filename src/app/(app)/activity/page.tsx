import Link from "next/link";
import { Activity as ActivityIcon, Flame, Plus, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import {
  getRecentActivityEntries,
  groupActivitiesByDate,
  totalCaloriesBurned,
  totalDurationMinutes,
} from "@/features/activity/queries";
import { ActivityEntryGroup } from "@/features/activity/activity-list";
import { requireUser } from "@/lib/supabase/auth";
import { formatKcal, formatMinutes } from "@/lib/format";
import { todayIso } from "@/lib/dates";

export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const user = await requireUser();
  const entries = await getRecentActivityEntries(user.id, 14);

  const today = todayIso();
  const todays = entries.filter((entry) => entry.entry_date === today);
  const grouped = Array.from(groupActivitiesByDate(entries).entries()).sort(([a], [b]) =>
    a < b ? 1 : a > b ? -1 : 0,
  );

  return (
    <>
      <PageHeader
        title="Activity"
        description="Log workouts and see the calories you burned over the last two weeks."
        actions={
          <Link href="/activity/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden /> Add activity
            </Button>
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Today's calories"
          value={formatKcal(totalCaloriesBurned(todays))}
          icon={Flame}
          tone="brand"
        />
        <StatCard
          label="Today's duration"
          value={formatMinutes(totalDurationMinutes(todays))}
          icon={Timer}
          tone="accent"
        />
        <StatCard
          label="Activities logged (14d)"
          value={String(entries.length)}
          icon={ActivityIcon}
          tone="slate"
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent activity
        </h2>
        {grouped.length === 0 ? (
          <EmptyState
            icon={ActivityIcon}
            title="No activities logged yet"
            description="Add your first workout to see estimated calories burned."
            action={
              <Link href="/activity/new">
                <Button>
                  <Plus className="h-4 w-4" aria-hidden /> Log an activity
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {grouped.map(([date, entries]) => (
              <ActivityEntryGroup key={date} date={date} entries={entries} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
