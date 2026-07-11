import type { ActivityType, Intensity, MealType } from "@/types/models";

export interface ParsedMealItem {
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  mealType?: MealType;
  confidence?: number;
}

export interface MealParseResult {
  items: ParsedMealItem[];
  source: "llm" | "heuristic";
  raw?: string;
}

export interface ParsedActivity {
  activityType: ActivityType;
  durationMin: number;
  distanceKm?: number;
  intensity: Intensity;
  caloriesBurned?: number;
  confidence?: number;
}

export interface ActivityParseResult {
  activities: ParsedActivity[];
  source: "llm" | "heuristic";
  raw?: string;
}

/**
 * Contract for natural language meal parsing.
 * Given a free-form input like "2 eggs, a slice of toast with butter, and
 * a coffee", the implementation should return structured food entries ready
 * to insert into the `food_entries` table.
 */
export interface MealParser {
  parse(input: string, context?: { userId?: string }): Promise<MealParseResult>;
}

/**
 * Contract for natural language activity parsing.
 * Given input like "ran 5k in 27 minutes at moderate pace", the implementation
 * should return one or more structured activity entries.
 */
export interface ActivityParser {
  parse(input: string, context?: { userId?: string }): Promise<ActivityParseResult>;
}
