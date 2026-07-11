"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { estimateCaloriesBurned } from "@/services/activity/calories";

const activitySchema = z.object({
  entryDate: z.string().min(1),
  activityType: z.enum([
    "walking",
    "running",
    "swimming",
    "cycling",
    "weight_training",
    "other",
  ]),
  durationMin: z.coerce.number().int().positive().max(1440),
  distanceKm: z.coerce.number().min(0).max(1000).optional().or(z.literal("")),
  intensity: z.enum(["low", "moderate", "high"]),
});

const deleteSchema = z.object({ id: z.string().uuid() });

export interface ActivityFormState {
  error?: string;
  success?: string;
}

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createActivityAction(
  _state: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const parsed = activitySchema.safeParse({
    entryDate: formValue(formData, "entryDate"),
    activityType: formValue(formData, "activityType"),
    durationMin: formValue(formData, "durationMin"),
    distanceKm: formValue(formData, "distanceKm") || undefined,
    intensity: formValue(formData, "intensity"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const first = Object.values(flat).find((messages) => messages && messages.length > 0)?.[0];
    return { error: first ?? "Please double-check the activity details." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_kg")
    .eq("id", user.id)
    .maybeSingle();

  const distanceKm =
    typeof parsed.data.distanceKm === "number" ? parsed.data.distanceKm : null;

  const caloriesBurned = estimateCaloriesBurned({
    activityType: parsed.data.activityType,
    intensity: parsed.data.intensity,
    durationMin: parsed.data.durationMin,
    weightKg: profile?.weight_kg ? Number(profile.weight_kg) : null,
    distanceKm,
  });

  const { error } = await supabase.from("activity_entries").insert({
    user_id: user.id,
    entry_date: parsed.data.entryDate,
    activity_type: parsed.data.activityType,
    duration_min: parsed.data.durationMin,
    distance_km: distanceKm,
    intensity: parsed.data.intensity,
    calories_burned: caloriesBurned,
  });

  if (error) return { error: error.message };

  revalidatePath("/activity");
  revalidatePath("/dashboard");
  redirect("/activity");
}

export async function deleteActivityAction(formData: FormData) {
  const parsed = deleteSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return;

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("activity_entries")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);
  revalidatePath("/activity");
  revalidatePath("/dashboard");
}
