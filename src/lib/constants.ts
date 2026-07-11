import type {
  ActivityLevel,
  ActivityType,
  Gender,
  Goal,
  Intensity,
  MealType,
} from "@/types/models";

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other / prefer not to say" },
];

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "light", label: "Light", description: "1-3 workouts / week" },
  { value: "moderate", label: "Moderate", description: "3-5 workouts / week" },
  { value: "active", label: "Active", description: "6-7 workouts / week" },
  { value: "very_active", label: "Very active", description: "Physical job or 2x/day training" },
];

export const GOALS: { value: Goal; label: string; description: string }[] = [
  { value: "lose_weight", label: "Lose weight", description: "Moderate calorie deficit" },
  { value: "maintain_weight", label: "Maintain weight", description: "Match your TDEE" },
  { value: "gain_weight", label: "Gain weight", description: "Gentle calorie surplus" },
  { value: "gain_muscle", label: "Gain muscle", description: "Higher protein & surplus" },
];

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "walking", label: "Walking" },
  { value: "running", label: "Running" },
  { value: "swimming", label: "Swimming" },
  { value: "cycling", label: "Cycling" },
  { value: "weight_training", label: "Weight training" },
  { value: "other", label: "Other" },
];

export const INTENSITIES: { value: Intensity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

export const FOOD_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "oz",
  "cup",
  "tbsp",
  "tsp",
  "serving",
  "slice",
  "piece",
] as const;
