import { Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteActivityAction } from "@/features/activity/actions";
import { formatDayLabel } from "@/lib/dates";
import { formatKcal, formatMinutes, formatNumber } from "@/lib/format";
import type { ActivityEntry, AiConfidence } from "@/types/models";

const ACTIVITY_LABELS: Record<ActivityEntry["activity_type"], string> = {
  walking: "Walking",
  running: "Running",
  swimming: "Swimming",
  cycling: "Cycling",
  weight_training: "Weight training",
  other: "Other",
};

const INTENSITY_LABELS: Record<ActivityEntry["intensity"], string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

const CONFIDENCE_TONE: Record<AiConfidence, "accent" | "warn" | "danger"> = {
  high: "accent",
  medium: "warn",
  low: "danger",
};

function AiSourceBadge({ confidence }: { confidence: AiConfidence | null }) {
  const tone = confidence ? CONFIDENCE_TONE[confidence] : "brand";
  const label = confidence ? `AI · ${confidence}` : "AI";
  return (
    <Badge tone={tone} className="gap-1" title="Estimated by AI">
      <Sparkles className="h-3 w-3" aria-hidden /> {label}
    </Badge>
  );
}

export function ActivityEntryGroup({
  date,
  entries,
}: {
  date: string;
  entries: ActivityEntry[];
}) {
  const totalKcal = entries.reduce((sum, e) => sum + Number(e.calories_burned), 0);
  const totalMin = entries.reduce((sum, e) => sum + e.duration_min, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-1 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">{formatDayLabel(date)}</div>
          <div className="text-xs text-slate-500">
            {entries.length} activit{entries.length === 1 ? "y" : "ies"} · {formatMinutes(totalMin)}
          </div>
        </div>
        <Badge tone="brand">{formatKcal(totalKcal)} burned</Badge>
      </header>
      <ul className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">
                  {ACTIVITY_LABELS[entry.activity_type]}
                </span>
                <Badge tone="slate">{INTENSITY_LABELS[entry.intensity]}</Badge>
                {entry.source === "ai" ? (
                  <AiSourceBadge confidence={entry.ai_confidence} />
                ) : null}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {formatMinutes(entry.duration_min)}
                {entry.distance_km != null
                  ? ` · ${formatNumber(Number(entry.distance_km), 2)} km`
                  : ""}{" "}
                · {formatKcal(Number(entry.calories_burned))}
              </div>
            </div>
            <form action={deleteActivityAction}>
              <input type="hidden" name="id" value={entry.id} />
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                aria-label={`Delete ${ACTIVITY_LABELS[entry.activity_type]} entry`}
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
