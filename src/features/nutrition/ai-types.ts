import type { FOOD_UNITS } from "@/lib/constants";
import type { AiConfidence, MealType } from "@/types/models";

export type AiParsedMealItem = {
  foodName: string;
  quantity: number;
  unit: (typeof FOOD_UNITS)[number];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export interface AiMealParseState {
  status: "idle" | "success" | "error";
  error?: string;
  parsed?: {
    input: string;
    entryDate: string;
    mealType: MealType;
    items: AiParsedMealItem[];
    confidence: AiConfidence;
    notes?: string;
  };
}

export const AI_MEAL_INITIAL_STATE: AiMealParseState = { status: "idle" };

export interface AiMealSaveState {
  error?: string;
  success?: string;
}

export const AI_MEAL_SAVE_INITIAL_STATE: AiMealSaveState = {};
