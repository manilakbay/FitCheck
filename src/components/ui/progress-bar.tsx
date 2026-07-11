import { clamp } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  suffix?: string;
  tone?: "brand" | "accent" | "warn" | "danger";
  className?: string;
}

const TONES: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  brand: "bg-brand-500",
  accent: "bg-accent-500",
  warn: "bg-warn-500",
  danger: "bg-danger-500",
};

export function ProgressBar({
  value,
  max,
  label,
  suffix,
  tone = "brand",
  className,
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max;
  const percent = clamp((value / safeMax) * 100, 0, 100);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || suffix) && (
        <div className="flex items-baseline justify-between text-xs">
          {label ? <span className="font-medium text-slate-600">{label}</span> : <span />}
          {suffix ? <span className="text-slate-500">{suffix}</span> : null}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={cn("h-full rounded-full transition-all", TONES[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
