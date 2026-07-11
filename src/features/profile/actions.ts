"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/supabase/auth";
import { todayIso } from "@/lib/dates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { estimateEnergy, hasCompleteProfile } from "@/services/profile/energy";
import type { EnergyInputs } from "@/services/profile/energy";

const profileSchema = z.object({
  fullName: z.string().trim().max(120).optional().or(z.literal("")),
  age: z.coerce.number().int().min(10).max(120),
  gender: z.enum(["male", "female", "other"]),
  heightCm: z.coerce.number().min(50).max(272),
  weightKg: z.coerce.number().min(20).max(500),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose_weight", "maintain_weight", "gain_weight", "gain_muscle"]),
  goalWeightKg: z.coerce.number().min(20).max(500).optional().or(z.literal("")),
});

export interface ProfileFormState {
  error?: string;
  success?: string;
}

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function saveProfileAction(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    fullName: formValue(formData, "fullName"),
    age: formValue(formData, "age"),
    gender: formValue(formData, "gender"),
    heightCm: formValue(formData, "heightCm"),
    weightKg: formValue(formData, "weightKg"),
    activityLevel: formValue(formData, "activityLevel"),
    goal: formValue(formData, "goal"),
    goalWeightKg: formValue(formData, "goalWeightKg") || undefined,
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const first = Object.values(flat).find((messages) => messages && messages.length > 0)?.[0];
    return { error: first ?? "Please fix the errors in the form." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const profileValues = {
    id: user.id,
    full_name: parsed.data.fullName?.trim() ? parsed.data.fullName.trim() : null,
    age: parsed.data.age,
    gender: parsed.data.gender,
    height_cm: parsed.data.heightCm,
    weight_kg: parsed.data.weightKg,
    activity_level: parsed.data.activityLevel,
    goal: parsed.data.goal,
  } as const;

  const { error: profileError } = await supabase.from("profiles").upsert(profileValues, {
    onConflict: "id",
  });
  if (profileError) return { error: profileError.message };

  const inputs: EnergyInputs = {
    age: parsed.data.age,
    gender: parsed.data.gender,
    height_cm: parsed.data.heightCm,
    weight_kg: parsed.data.weightKg,
    activity_level: parsed.data.activityLevel,
    goal: parsed.data.goal,
  };

  if (hasCompleteProfile(inputs)) {
    const energy = estimateEnergy(inputs);
    const goalWeight =
      typeof parsed.data.goalWeightKg === "number" ? parsed.data.goalWeightKg : null;

    const { error: goalsError } = await supabase.from("daily_goals").upsert(
      {
        user_id: user.id,
        calorie_target: energy.calorieTarget,
        protein_target_g: energy.proteinTargetG,
        carbs_target_g: energy.carbsTargetG,
        fat_target_g: energy.fatTargetG,
        goal_weight_kg: goalWeight,
      },
      { onConflict: "user_id" },
    );
    if (goalsError) return { error: goalsError.message };
  }

  const { error: weightError } = await supabase.from("weight_records").upsert(
    {
      user_id: user.id,
      weight_kg: parsed.data.weightKg,
      recorded_on: todayIso(),
    },
    { onConflict: "user_id,recorded_on" },
  );
  if (weightError) return { error: weightError.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Profile saved. Your targets are up to date." };
}
