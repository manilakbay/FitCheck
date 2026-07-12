"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { FOOD_UNITS } from "@/lib/constants";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AiApiError,
  AiKeyMissingError,
  AiRateLimitError,
  AiSchemaError,
} from "@/services/ai/errors";
import { mealParser } from "@/services/ai/mealParser";
import type {
  AiMealParseState,
  AiMealSaveState,
} from "@/features/nutrition/ai-types";

const foodEntrySchema = z.object({
  entryDate: z.string().min(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  foodName: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().positive(),
  unit: z.string().trim().min(1).max(20),
  calories: z.coerce.number().nonnegative(),
  protein: z.coerce.number().nonnegative(),
  carbs: z.coerce.number().nonnegative(),
  fat: z.coerce.number().nonnegative(),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export interface FoodFormState {
  error?: string;
  success?: string;
}

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createFoodEntryAction(
  _state: FoodFormState,
  formData: FormData,
): Promise<FoodFormState> {
  const parsed = foodEntrySchema.safeParse({
    entryDate: formValue(formData, "entryDate"),
    mealType: formValue(formData, "mealType"),
    foodName: formValue(formData, "foodName"),
    quantity: formValue(formData, "quantity"),
    unit: formValue(formData, "unit"),
    calories: formValue(formData, "calories"),
    protein: formValue(formData, "protein"),
    carbs: formValue(formData, "carbs"),
    fat: formValue(formData, "fat"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const first = Object.values(flat).find((messages) => messages && messages.length > 0)?.[0];
    return { error: first ?? "Please double-check the meal details." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("food_entries").insert({
    user_id: user.id,
    entry_date: parsed.data.entryDate,
    meal_type: parsed.data.mealType,
    food_name: parsed.data.foodName,
    quantity: parsed.data.quantity,
    unit: parsed.data.unit,
    calories: parsed.data.calories,
    protein_g: parsed.data.protein,
    carbs_g: parsed.data.carbs,
    fat_g: parsed.data.fat,
  });

  if (error) return { error: error.message };

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
  redirect("/nutrition");
}

export async function deleteFoodEntryAction(formData: FormData) {
  const parsed = deleteSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return;

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase.from("food_entries").delete().eq("id", parsed.data.id).eq("user_id", user.id);
  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------
// AI meal logging
// ---------------------------------------------------------------------

const MEAL_TYPE_ENUM = ["breakfast", "lunch", "dinner", "snack"] as const;

const aiParseInputSchema = z.object({
  input: z.string().trim().min(3, "Describe your meal in a few words.").max(2000),
  entryDate: z.string().min(1),
  mealType: z.enum(MEAL_TYPE_ENUM),
});

function humanizeAiError(err: unknown): string {
  if (err instanceof AiKeyMissingError) {
    return "Add your OpenAI API key on the Settings page to use AI logging.";
  }
  if (err instanceof AiRateLimitError) {
    return err.message;
  }
  if (err instanceof AiApiError) {
    if (err.status === 401) return "OpenAI rejected your API key. Please update it in Settings.";
    if (err.status === 402) return "OpenAI account payment or quota issue. Check your OpenAI billing.";
    if (err.status === 429) return "OpenAI rate limit reached. Please try again shortly.";
    if (err.status >= 500) return "OpenAI is having trouble right now. Please try again in a moment.";
    return `AI request failed (${err.status}). Please try again.`;
  }
  if (err instanceof AiSchemaError) {
    return "The AI returned an unexpected response. Try rephrasing your description.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export async function parseMealAiAction(
  _state: AiMealParseState,
  formData: FormData,
): Promise<AiMealParseState> {
  const parsed = aiParseInputSchema.safeParse({
    input: formValue(formData, "input"),
    entryDate: formValue(formData, "entryDate"),
    mealType: formValue(formData, "mealType"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const first = Object.values(flat).find((messages) => messages && messages.length > 0)?.[0];
    return { status: "error", error: first ?? "Please check the fields." };
  }

  const user = await requireUser();

  try {
    const result = await mealParser.parse(parsed.data.input, {
      userId: user.id,
      mealType: parsed.data.mealType,
    });
    return {
      status: "success",
      parsed: {
        input: parsed.data.input,
        entryDate: parsed.data.entryDate,
        mealType: parsed.data.mealType,
        items: result.items,
        confidence: result.confidence,
        notes: result.notes,
      },
    };
  } catch (err) {
    return { status: "error", error: humanizeAiError(err) };
  }
}

const aiSaveItemSchema = z.object({
  foodName: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().positive().max(10000),
  unit: z.enum(FOOD_UNITS),
  calories: z.coerce.number().min(0).max(20000),
  protein_g: z.coerce.number().min(0).max(1000),
  carbs_g: z.coerce.number().min(0).max(2000),
  fat_g: z.coerce.number().min(0).max(1000),
});

const aiSavePayloadSchema = z.object({
  entryDate: z.string().min(1),
  mealType: z.enum(MEAL_TYPE_ENUM),
  confidence: z.enum(["low", "medium", "high"]),
  items: z.array(aiSaveItemSchema).min(1).max(20),
});

export async function saveAiMealBatchAction(
  _state: AiMealSaveState,
  formData: FormData,
): Promise<AiMealSaveState> {
  const raw = formValue(formData, "payload");
  if (!raw) {
    return { error: "Missing meal data." };
  }
  let jsonPayload: unknown;
  try {
    jsonPayload = JSON.parse(raw);
  } catch {
    return { error: "Could not read the meal data." };
  }

  const parsed = aiSavePayloadSchema.safeParse(jsonPayload);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      Object.values(flat.fieldErrors).find((m) => m && m.length > 0)?.[0] ??
      flat.formErrors[0];
    return { error: first ?? "Some meal fields look invalid — please review and try again." };
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const rows = parsed.data.items.map((item) => ({
    user_id: user.id,
    entry_date: parsed.data.entryDate,
    meal_type: parsed.data.mealType,
    food_name: item.foodName,
    quantity: item.quantity,
    unit: item.unit,
    calories: item.calories,
    protein_g: item.protein_g,
    carbs_g: item.carbs_g,
    fat_g: item.fat_g,
    source: "ai" as const,
    ai_confidence: parsed.data.confidence,
  }));

  const { error } = await supabase.from("food_entries").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
  redirect("/nutrition");
}
