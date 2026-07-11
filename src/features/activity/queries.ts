import { subDays } from "date-fns";

import { isoDate, todayIso } from "@/lib/dates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActivityEntry } from "@/types/models";

export async function getActivityEntriesInRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<ActivityEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("activity_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", startDate)
    .lte("entry_date", endDate)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  return (data as ActivityEntry[] | null) ?? [];
}

export async function getRecentActivityEntries(
  userId: string,
  days = 14,
): Promise<ActivityEntry[]> {
  const end = todayIso();
  const start = isoDate(subDays(new Date(), days - 1));
  return getActivityEntriesInRange(userId, start, end);
}

export function totalCaloriesBurned(entries: ActivityEntry[]): number {
  return entries.reduce((sum, entry) => sum + (Number(entry.calories_burned) || 0), 0);
}

export function totalDurationMinutes(entries: ActivityEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.duration_min, 0);
}

export function groupActivitiesByDate(
  entries: ActivityEntry[],
): Map<string, ActivityEntry[]> {
  const map = new Map<string, ActivityEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.entry_date) ?? [];
    list.push(entry);
    map.set(entry.entry_date, list);
  }
  return map;
}

export function caloriesBurnedByDate(entries: ActivityEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const value = map.get(entry.entry_date) ?? 0;
    map.set(entry.entry_date, value + (Number(entry.calories_burned) || 0));
  }
  return map;
}
