import { subDays } from "date-fns";

import { isoDate, todayIso } from "@/lib/dates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EMPTY_MACROS, type FoodEntry, type MacroTotals } from "@/types/models";

export async function getFoodEntriesInRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<FoodEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("food_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", startDate)
    .lte("entry_date", endDate)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  return (data as FoodEntry[] | null) ?? [];
}

export async function getRecentFoodEntries(userId: string, days = 14): Promise<FoodEntry[]> {
  const end = todayIso();
  const start = isoDate(subDays(new Date(), days - 1));
  return getFoodEntriesInRange(userId, start, end);
}

export function totalsForEntries(entries: FoodEntry[]): MacroTotals {
  return entries.reduce<MacroTotals>((acc, entry) => {
    acc.calories += Number(entry.calories) || 0;
    acc.protein_g += Number(entry.protein_g) || 0;
    acc.carbs_g += Number(entry.carbs_g) || 0;
    acc.fat_g += Number(entry.fat_g) || 0;
    return acc;
  }, { ...EMPTY_MACROS });
}

export function totalsByDate(entries: FoodEntry[]): Map<string, MacroTotals> {
  const map = new Map<string, MacroTotals>();
  for (const entry of entries) {
    const totals = map.get(entry.entry_date) ?? { ...EMPTY_MACROS };
    totals.calories += Number(entry.calories) || 0;
    totals.protein_g += Number(entry.protein_g) || 0;
    totals.carbs_g += Number(entry.carbs_g) || 0;
    totals.fat_g += Number(entry.fat_g) || 0;
    map.set(entry.entry_date, totals);
  }
  return map;
}

export function groupByDate(entries: FoodEntry[]): Map<string, FoodEntry[]> {
  const map = new Map<string, FoodEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.entry_date) ?? [];
    list.push(entry);
    map.set(entry.entry_date, list);
  }
  return map;
}
