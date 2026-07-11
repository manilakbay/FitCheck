import { z } from "zod";

import { FOOD_UNITS } from "@/lib/constants";
import type {
  ActivityType,
  AiConfidence,
  AiModel,
  Intensity,
  MealType,
} from "@/types/models";

// ---------------------------------------------------------------------
// Shared enums (mirrored to Zod for structured-output validation)
// ---------------------------------------------------------------------

const ACTIVITY_TYPE_VALUES = [
  "walking",
  "running",
  "swimming",
  "cycling",
  "weight_training",
  "other",
] as const;
const INTENSITY_VALUES = ["low", "moderate", "high"] as const;
const CONFIDENCE_VALUES = ["low", "medium", "high"] as const;
const MODEL_VALUES = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"] as const;

export const AI_MODELS = MODEL_VALUES;

export function isSupportedModel(model: string): model is AiModel {
  return (MODEL_VALUES as readonly string[]).includes(model);
}

// ---------------------------------------------------------------------
// Meal parser
// ---------------------------------------------------------------------

export const MealParseSchema = z.object({
  items: z
    .array(
      z.object({
        food_name: z.string().min(1).max(200),
        quantity: z.number().positive().max(10000),
        unit: z.enum(FOOD_UNITS),
        calories: z.number().min(0).max(20000),
        protein_g: z.number().min(0).max(1000),
        carbs_g: z.number().min(0).max(2000),
        fat_g: z.number().min(0).max(1000),
      }),
    )
    .min(1)
    .max(20),
  confidence: z.enum(CONFIDENCE_VALUES),
  notes: z.string().max(500).optional(),
});

export type MealParseSchemaOutput = z.infer<typeof MealParseSchema>;

export interface ParsedMealItem {
  foodName: string;
  quantity: number;
  unit: (typeof FOOD_UNITS)[number];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealParseResult {
  items: ParsedMealItem[];
  confidence: AiConfidence;
  mealType?: MealType;
  notes?: string;
  raw: string;
}

export interface MealParseContext {
  userId: string;
  mealType?: MealType;
}

export interface MealParser {
  parse(input: string, context: MealParseContext): Promise<MealParseResult>;
}

// ---------------------------------------------------------------------
// Activity parser
// ---------------------------------------------------------------------

export const ActivityParseSchema = z.object({
  activity_type: z.enum(ACTIVITY_TYPE_VALUES),
  duration_min: z.number().int().positive().max(1440),
  distance_km: z.number().positive().max(1000).nullable().optional(),
  intensity: z.enum(INTENSITY_VALUES),
  confidence: z.enum(CONFIDENCE_VALUES),
  notes: z.string().max(500).optional(),
});

export type ActivityParseSchemaOutput = z.infer<typeof ActivityParseSchema>;

export interface ParsedActivity {
  activityType: ActivityType;
  durationMin: number;
  distanceKm: number | null;
  intensity: Intensity;
  confidence: AiConfidence;
  notes?: string;
}

export interface ActivityProfileContext {
  weightKg: number | null;
  age: number | null;
  gender: "male" | "female" | "other" | null;
  activityLevel: string | null;
}

export interface ActivityParseContext {
  userId: string;
  profile: ActivityProfileContext;
}

export interface ActivityParseResult {
  activity: ParsedActivity;
  raw: string;
}

export interface ActivityParser {
  parse(input: string, context: ActivityParseContext): Promise<ActivityParseResult>;
}
