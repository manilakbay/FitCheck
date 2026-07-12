"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { estimateCaloriesBurned } from "@/services/activity/calories";
import { activityParser } from "@/services/ai/activityParser";
import {
  AiApiError,
  AiKeyMissingError,
  AiRateLimitError,
  AiSchemaError,
} from "@/services/ai/errors";
import type {
  AiActivityParseState,
  AiActivitySaveState,
} from "@/features/activity/ai-types";

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

  const caloriesBurned = estimateCaloriesBurned({
    activityType: parsed.data.activityType,
    intensity: parsed.data.intensity,
    durationMin: parsed.data.durationMin,
    weightKg: profile?.weight_kg ? Number(profile.weight_kg) : null,
  });

  const { error } = await supabase.from("activity_entries").insert({
    user_id: user.id,
    entry_date: parsed.data.entryDate,
    activity_type: parsed.data.activityType,
    duration_min: parsed.data.durationMin,
    distance_km:
      typeof parsed.data.distanceKm === "number" ? parsed.data.distanceKm : null,
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

// ---------------------------------------------------------------------
// AI activity logging
// ---------------------------------------------------------------------

const ACTIVITY_TYPE_ENUM = [
  "walking",
  "running",
  "swimming",
  "cycling",
  "weight_training",
  "other",
] as const;
const INTENSITY_ENUM = ["low", "moderate", "high"] as const;

const aiParseInputSchema = z.object({
  input: z.string().trim().min(3, "Describe your workout in a few words.").max(1000),
  entryDate: z.string().min(1),
});

function humanizeAiError(err: unknown): string {
  if (err instanceof AiKeyMissingError) {
    return "Add your OpenAI API key on the Settings page to use AI logging.";
  }
  if (err instanceof AiApiError) {
    if (err.code === "insufficient_quota") {
      return "Your OpenAI account has no available credit. Add billing at platform.openai.com/account/billing to enable AI logging.";
    }
    if (err.status === 401) return "OpenAI rejected your API key. Please update it in Settings.";
    if (err.status === 402) return "OpenAI account payment or quota issue. Check your OpenAI billing.";
    if (err.status === 429) return "OpenAI rate limit reached. Please try again shortly.";
    if (err.status >= 500) return "OpenAI is having trouble right now. Please try again in a moment.";
    return `AI request failed (${err.status}). Please try again.`;
  }
  if (err instanceof AiRateLimitError) {
    return err.message;
  }
  if (err instanceof AiSchemaError) {
    return "The AI returned an unexpected response. Try rephrasing your description.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export async function parseActivityAiAction(
  _state: AiActivityParseState,
  formData: FormData,
): Promise<AiActivityParseState> {
  const parsed = aiParseInputSchema.safeParse({
    input: formValue(formData, "input"),
    entryDate: formValue(formData, "entryDate"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const first = Object.values(flat).find((messages) => messages && messages.length > 0)?.[0];
    return { status: "error", error: first ?? "Please check the fields." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("age, gender, weight_kg, activity_level")
    .eq("id", user.id)
    .maybeSingle();

  try {
    const result = await activityParser.parse(parsed.data.input, {
      userId: user.id,
      profile: {
        weightKg: profile?.weight_kg ? Number(profile.weight_kg) : null,
        age: profile?.age ? Number(profile.age) : null,
        gender: (profile?.gender as "male" | "female" | "other" | null) ?? null,
        activityLevel: profile?.activity_level ?? null,
      },
    });

    return {
      status: "success",
      parsed: {
        input: parsed.data.input,
        entryDate: parsed.data.entryDate,
        draft: {
          activityType: result.activity.activityType,
          durationMin: result.activity.durationMin,
          distanceKm: result.activity.distanceKm,
          intensity: result.activity.intensity,
        },
        confidence: result.activity.confidence,
        notes: result.activity.notes,
      },
    };
  } catch (err) {
    return { status: "error", error: humanizeAiError(err) };
  }
}

const aiSavePayloadSchema = z.object({
  entryDate: z.string().min(1),
  activityType: z.enum(ACTIVITY_TYPE_ENUM),
  durationMin: z.coerce.number().int().positive().max(1440),
  distanceKm: z.union([z.coerce.number().min(0).max(1000), z.null()]).optional(),
  intensity: z.enum(INTENSITY_ENUM),
  confidence: z.enum(["low", "medium", "high"]),
});

export async function saveAiActivityAction(
  _state: AiActivitySaveState,
  formData: FormData,
): Promise<AiActivitySaveState> {
  const raw = formValue(formData, "payload");
  if (!raw) return { error: "Missing activity data." };

  let jsonPayload: unknown;
  try {
    jsonPayload = JSON.parse(raw);
  } catch {
    return { error: "Could not read the activity data." };
  }

  const parsed = aiSavePayloadSchema.safeParse(jsonPayload);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      Object.values(flat.fieldErrors).find((m) => m && m.length > 0)?.[0] ??
      flat.formErrors[0];
    return { error: first ?? "Some activity fields look invalid — please review and try again." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_kg")
    .eq("id", user.id)
    .maybeSingle();

  const caloriesBurned = estimateCaloriesBurned({
    activityType: parsed.data.activityType,
    intensity: parsed.data.intensity,
    durationMin: parsed.data.durationMin,
    weightKg: profile?.weight_kg ? Number(profile.weight_kg) : null,
  });

  const { error } = await supabase.from("activity_entries").insert({
    user_id: user.id,
    entry_date: parsed.data.entryDate,
    activity_type: parsed.data.activityType,
    duration_min: parsed.data.durationMin,
    distance_km:
      typeof parsed.data.distanceKm === "number" ? parsed.data.distanceKm : null,
    intensity: parsed.data.intensity,
    calories_burned: caloriesBurned,
    source: "ai",
    ai_confidence: parsed.data.confidence,
  });

  if (error) return { error: error.message };

  revalidatePath("/activity");
  revalidatePath("/dashboard");
  redirect("/activity");
}
