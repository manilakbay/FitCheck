import { clamp, round } from "@/lib/utils";
import type { ActivityLevel, Gender, Goal } from "@/types/models";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose_weight: -500,
  maintain_weight: 0,
  gain_weight: 300,
  gain_muscle: 400,
};

const MACRO_SPLITS: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  lose_weight: { protein: 0.35, carbs: 0.4, fat: 0.25 },
  maintain_weight: { protein: 0.3, carbs: 0.45, fat: 0.25 },
  gain_weight: { protein: 0.25, carbs: 0.5, fat: 0.25 },
  gain_muscle: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

const MIN_SAFE_CALORIE_TARGET = 1200;

export interface EnergyInputs {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
}

export interface EnergyEstimate {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
}

/**
 * Mifflin-St Jeor equation. "Other" gender averages the male and female
 * offsets (+5 / -161) → offset of -78.
 */
export function calculateBmr(input: EnergyInputs): number {
  const base = 10 * input.weight_kg + 6.25 * input.height_cm - 5 * input.age;
  const offset = input.gender === "male" ? 5 : input.gender === "female" ? -161 : -78;
  return round(base + offset);
}

export function calculateTdee(input: EnergyInputs): number {
  const bmr = calculateBmr(input);
  return round(bmr * ACTIVITY_MULTIPLIERS[input.activity_level]);
}

export function calculateCalorieTarget(input: EnergyInputs): number {
  const tdee = calculateTdee(input);
  const adjusted = tdee + GOAL_ADJUSTMENTS[input.goal];
  return round(Math.max(adjusted, MIN_SAFE_CALORIE_TARGET));
}

export function calculateMacroTargets(calorieTarget: number, goal: Goal) {
  const split = MACRO_SPLITS[goal];
  return {
    proteinTargetG: round((calorieTarget * split.protein) / KCAL_PER_G.protein),
    carbsTargetG: round((calorieTarget * split.carbs) / KCAL_PER_G.carbs),
    fatTargetG: round((calorieTarget * split.fat) / KCAL_PER_G.fat),
  };
}

export function estimateEnergy(input: EnergyInputs): EnergyEstimate {
  const bmr = calculateBmr(input);
  const tdee = round(bmr * ACTIVITY_MULTIPLIERS[input.activity_level]);
  const calorieTarget = clamp(
    round(tdee + GOAL_ADJUSTMENTS[input.goal]),
    MIN_SAFE_CALORIE_TARGET,
    10000,
  );
  const macros = calculateMacroTargets(calorieTarget, input.goal);
  return {
    bmr,
    tdee,
    calorieTarget,
    ...macros,
  };
}

export function hasCompleteProfile(input: Partial<EnergyInputs>): input is EnergyInputs {
  return (
    typeof input.age === "number" &&
    typeof input.height_cm === "number" &&
    typeof input.weight_kg === "number" &&
    !!input.gender &&
    !!input.activity_level &&
    !!input.goal
  );
}
