import { addDays, format, parseISO, startOfDay, subDays } from "date-fns";

export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function isoDate(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function parseIsoDate(value: string): Date {
  return parseISO(value);
}

export function lastNDays(n: number, endDate: Date = new Date()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(format(subDays(endDate, i), "yyyy-MM-dd"));
  }
  return days;
}

export function nextDay(dateIso: string): string {
  return format(addDays(parseISO(dateIso), 1), "yyyy-MM-dd");
}

export function formatDayLabel(dateIso: string): string {
  return format(parseISO(dateIso), "MMM d");
}

export function formatLongDate(dateIso: string): string {
  return format(parseISO(dateIso), "EEEE, MMMM d, yyyy");
}

/**
 * Human-friendly day label: "Today" / "Yesterday" / "Mon" (this week) / "Mmm d".
 */
export function relativeDay(dateIso: string, today: string = todayIso()): string {
  if (dateIso === today) return "Today";
  const yesterday = format(subDays(parseISO(today), 1), "yyyy-MM-dd");
  if (dateIso === yesterday) return "Yesterday";
  const entry = parseISO(dateIso);
  const daysAgo = Math.round(
    (parseISO(today).getTime() - entry.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysAgo > 0 && daysAgo < 7) return format(entry, "EEEE");
  return format(entry, "MMM d");
}
