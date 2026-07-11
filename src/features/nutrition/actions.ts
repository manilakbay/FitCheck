"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
