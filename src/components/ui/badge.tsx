import * as React from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "brand" | "accent" | "warn" | "danger" | "slate";
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  accent: "bg-green-50 text-green-700 border-green-100",
  warn: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-red-50 text-red-700 border-red-100",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export function Badge({ className, tone = "brand", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
