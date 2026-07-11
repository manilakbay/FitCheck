import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DailyGoal, Profile } from "@/types/models";

export async function getProfileAndGoals(userId: string): Promise<{
  profile: Profile | null;
  goal: DailyGoal | null;
}> {
  const supabase = await createSupabaseServerClient();
  const [profileResult, goalResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("daily_goals").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  return {
    profile: (profileResult.data as Profile | null) ?? null,
    goal: (goalResult.data as DailyGoal | null) ?? null,
  };
}
