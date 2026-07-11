import { subDays } from "date-fns";

import { isoDate, lastNDays, todayIso } from "@/lib/dates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ActivityEntry,
  DailyGoal,
  FoodEntry,
  MacroTotals,
  Profile,
  WeightRecord,
} from "@/types/models";

const RANGE_DAYS = 14;

export interface DashboardData {
  today: string;
  rangeDates: string[];
  profile: Profile | null;
  goal: DailyGoal | null;
  latestWeight: WeightRecord | null;
  todaysFood: FoodEntry[];
  todaysActivity: ActivityEntry[];
  recentFood: FoodEntry[];
  recentActivity: ActivityEntry[];
  weightSeries: { date: string; weight_kg: number | null }[];
  caloriesInSeries: { date: string; calories: number }[];
  caloriesOutSeries: { date: string; calories: number }[];
  proteinSeries: { date: string; protein_g: number }[];
}

function sumTotals(entries: FoodEntry[]): MacroTotals {
  return entries.reduce<MacroTotals>(
    (acc, entry) => {
      acc.calories += Number(entry.calories) || 0;
      acc.protein_g += Number(entry.protein_g) || 0;
      acc.carbs_g += Number(entry.carbs_g) || 0;
      acc.fat_g += Number(entry.fat_g) || 0;
      return acc;
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const today = todayIso();
  const rangeStart = isoDate(subDays(new Date(), RANGE_DAYS - 1));
  const rangeDates = lastNDays(RANGE_DAYS);

  const [
    profileResult,
    goalResult,
    latestWeightResult,
    foodInRangeResult,
    activityInRangeResult,
    weightInRangeResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("daily_goals").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("weight_records")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_on", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("food_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_date", rangeStart)
      .lte("entry_date", today)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_date", rangeStart)
      .lte("entry_date", today)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("weight_records")
      .select("*")
      .eq("user_id", userId)
      .gte("recorded_on", rangeStart)
      .lte("recorded_on", today)
      .order("recorded_on", { ascending: true }),
  ]);

  const profile = (profileResult.data as Profile | null) ?? null;
  const goal = (goalResult.data as DailyGoal | null) ?? null;
  const latestWeight = (latestWeightResult.data as WeightRecord | null) ?? null;
  const foodEntries = (foodInRangeResult.data as FoodEntry[] | null) ?? [];
  const activityEntries = (activityInRangeResult.data as ActivityEntry[] | null) ?? [];
  const weightEntries = (weightInRangeResult.data as WeightRecord[] | null) ?? [];

  const foodByDate = new Map<string, MacroTotals>();
  for (const entry of foodEntries) {
    const totals = foodByDate.get(entry.entry_date) ?? {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    };
    totals.calories += Number(entry.calories) || 0;
    totals.protein_g += Number(entry.protein_g) || 0;
    totals.carbs_g += Number(entry.carbs_g) || 0;
    totals.fat_g += Number(entry.fat_g) || 0;
    foodByDate.set(entry.entry_date, totals);
  }

  const activityByDate = new Map<string, number>();
  for (const entry of activityEntries) {
    activityByDate.set(
      entry.entry_date,
      (activityByDate.get(entry.entry_date) ?? 0) + (Number(entry.calories_burned) || 0),
    );
  }

  const weightByDate = new Map<string, number>();
  for (const entry of weightEntries) {
    weightByDate.set(entry.recorded_on, Number(entry.weight_kg));
  }

  let lastKnownWeight: number | null = null;
  const weightSeries = rangeDates.map((date) => {
    if (weightByDate.has(date)) {
      lastKnownWeight = weightByDate.get(date) ?? lastKnownWeight;
    }
    return { date, weight_kg: lastKnownWeight };
  });

  const caloriesInSeries = rangeDates.map((date) => ({
    date,
    calories: Math.round(foodByDate.get(date)?.calories ?? 0),
  }));

  const caloriesOutSeries = rangeDates.map((date) => ({
    date,
    calories: Math.round(activityByDate.get(date) ?? 0),
  }));

  const proteinSeries = rangeDates.map((date) => ({
    date,
    protein_g: Math.round(foodByDate.get(date)?.protein_g ?? 0),
  }));

  const todaysFood = foodEntries.filter((entry) => entry.entry_date === today);
  const todaysActivity = activityEntries.filter((entry) => entry.entry_date === today);
  const recentFood = foodEntries.slice(0, 5);
  const recentActivity = activityEntries.slice(0, 5);

  return {
    today,
    rangeDates,
    profile,
    goal,
    latestWeight,
    todaysFood,
    todaysActivity,
    recentFood,
    recentActivity,
    weightSeries,
    caloriesInSeries,
    caloriesOutSeries,
    proteinSeries,
  };
}

export const sumFoodTotals = sumTotals;
