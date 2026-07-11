import { round } from "@/lib/utils";
import type { ActivityType, Intensity } from "@/types/models";

/**
 * MET (Metabolic Equivalent of Task) table indexed by activity type and
 * intensity. Values taken from the Compendium of Physical Activities
 * (Ainsworth et al., 2011), rounded for readability.
 */
const MET_TABLE: Record<ActivityType, Record<Intensity, number>> = {
  walking: { low: 2.8, moderate: 3.8, high: 5.0 },
  running: { low: 7.0, moderate: 9.8, high: 12.5 },
  swimming: { low: 5.5, moderate: 8.0, high: 10.0 },
  cycling: { low: 4.0, moderate: 8.0, high: 12.0 },
  weight_training: { low: 3.5, moderate: 5.0, high: 6.0 },
  other: { low: 3.0, moderate: 5.0, high: 7.0 },
};

const DEFAULT_WEIGHT_KG = 70;

export interface ActivityCaloriesInput {
  activityType: ActivityType;
  intensity: Intensity;
  durationMin: number;
  weightKg?: number | null;
}

/**
 * Calories burned = MET × weight (kg) × time (hours).
 * When the user has no recorded weight we fall back to a 70kg default
 * so we can still show a sensible estimate.
 */
export function estimateCaloriesBurned(input: ActivityCaloriesInput): number {
  const met = MET_TABLE[input.activityType][input.intensity];
  const weight = input.weightKg && input.weightKg > 0 ? input.weightKg : DEFAULT_WEIGHT_KG;
  const hours = Math.max(input.durationMin, 0) / 60;
  return round(met * weight * hours, 1);
}

export function getMetValue(activityType: ActivityType, intensity: Intensity): number {
  return MET_TABLE[activityType][intensity];
}
