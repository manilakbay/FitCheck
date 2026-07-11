export type Gender = "male" | "female" | "other";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type Goal = "lose_weight" | "maintain_weight" | "gain_weight" | "gain_muscle";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type ActivityType =
  | "walking"
  | "running"
  | "swimming"
  | "cycling"
  | "weight_training"
  | "other";

export type Intensity = "low" | "moderate" | "high";

export type Profile = {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: Gender | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
  created_at: string;
  updated_at: string;
};

export type WeightRecord = {
  id: string;
  user_id: string;
  weight_kg: number;
  recorded_on: string;
  created_at: string;
  updated_at: string;
};

export type EntrySource = "manual" | "ai";
export type AiConfidence = "low" | "medium" | "high";

export type FoodEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  meal_type: MealType;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: EntrySource;
  ai_confidence: AiConfidence | null;
  created_at: string;
  updated_at: string;
};

export type ActivityEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  activity_type: ActivityType;
  duration_min: number;
  distance_km: number | null;
  intensity: Intensity;
  calories_burned: number;
  source: EntrySource;
  ai_confidence: AiConfidence | null;
  created_at: string;
  updated_at: string;
};

export type DailyGoal = {
  user_id: string;
  calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  goal_weight_kg: number | null;
  created_at: string;
  updated_at: string;
};

export type MacroTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export const EMPTY_MACROS: MacroTotals = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
};

export type AiProvider = "openai";

export type AiModel = "gpt-4o-mini" | "gpt-4o" | "gpt-4.1-mini";

export type UserAiSettings = {
  user_id: string;
  provider: AiProvider;
  model: string;
  api_key_ciphertext: string | null;
  api_key_iv: string | null;
  api_key_last4: string | null;
  enabled: boolean;
  monthly_request_count: number;
  monthly_request_reset: string;
  created_at: string;
  updated_at: string;
};

/**
 * Redacted projection of {@link UserAiSettings} that is safe to hand
 * to client components. The ciphertext and IV never leave the server.
 */
export type UserAiSettingsPublic = {
  provider: AiProvider;
  model: string;
  enabled: boolean;
  hasKey: boolean;
  apiKeyLast4: string | null;
  monthlyRequestCount: number;
  monthlyRequestReset: string;
  updatedAt: string;
};
