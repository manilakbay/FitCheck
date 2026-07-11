import { round } from "@/lib/utils";
import type { ActivityType, Intensity } from "@/types/models";

/**
 * MET (Metabolic Equivalent of Task) table indexed by activity type and
 * self-reported intensity. Values taken from the Compendium of Physical
 * Activities (Ainsworth et al., 2011), rounded for readability.
 * Used when distance is not provided or the activity doesn't support pace.
 */
const INTENSITY_MET_TABLE: Record<ActivityType, Record<Intensity, number>> = {
  walking: { low: 2.8, moderate: 3.8, high: 5.0 },
  running: { low: 7.0, moderate: 9.8, high: 12.5 },
  swimming: { low: 5.5, moderate: 8.0, high: 10.0 },
  cycling: { low: 4.0, moderate: 8.0, high: 12.0 },
  weight_training: { low: 3.5, moderate: 5.0, high: 6.0 },
  other: { low: 3.0, moderate: 5.0, high: 7.0 },
};

/**
 * Pace-derived MET values by speed (km/h). Sourced from the Compendium of
 * Physical Activities. We linearly interpolate between anchors and clamp at
 * the extremes so extreme inputs stay bounded to a realistic maximum.
 * Only defined for activities where distance meaningfully implies effort.
 */
const SPEED_MET_TABLES: Partial<Record<ActivityType, ReadonlyArray<readonly [number, number]>>> = {
  walking: [
    [3.2, 2.8],
    [4.0, 3.0],
    [4.8, 3.5],
    [5.6, 4.3],
    [6.4, 5.0],
    [7.2, 7.0],
    [8.0, 8.3],
  ],
  running: [
    [6.4, 6.0],
    [8.0, 8.3],
    [9.7, 9.8],
    [11.3, 11.0],
    [12.9, 11.8],
    [14.5, 12.8],
    [16.1, 14.5],
    [17.7, 16.0],
    [19.3, 19.0],
    [20.9, 19.8],
    [22.5, 23.0],
  ],
  cycling: [
    [8.0, 4.0],
    [16.0, 6.8],
    [19.2, 8.0],
    [22.4, 10.0],
    [25.6, 12.0],
    [30.6, 15.8],
  ],
  swimming: [
    [1.6, 5.8],
    [2.4, 8.3],
    [3.2, 10.0],
  ],
};

/**
 * Upper bound (km/h) beyond which a self-reported distance/duration pair is
 * almost certainly a data entry error. Used purely to surface a hint in the
 * UI — the estimate itself is already clamped to the top of the MET table.
 */
const PLAUSIBLE_MAX_SPEED_KMH: Partial<Record<ActivityType, number>> = {
  walking: 10,
  running: 25,
  cycling: 80,
  swimming: 8,
};

const DEFAULT_WEIGHT_KG = 70;

export type CaloriesMethod = "pace" | "intensity";

export interface ActivityCaloriesInput {
  activityType: ActivityType;
  intensity: Intensity;
  durationMin: number;
  weightKg?: number | null;
  distanceKm?: number | null;
}

export interface ActivityCaloriesDetail {
  calories: number;
  met: number;
  method: CaloriesMethod;
  speedKmh: number | null;
  speedImplausible: boolean;
}

function interpolateMet(
  table: ReadonlyArray<readonly [number, number]>,
  speedKmh: number,
): number {
  const first = table[0];
  const last = table[table.length - 1];
  if (!first || !last) return 0;
  if (speedKmh <= first[0]) return first[1];
  if (speedKmh >= last[0]) return last[1];
  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (!lo || !hi) continue;
    const [s1, m1] = lo;
    const [s2, m2] = hi;
    if (speedKmh >= s1 && speedKmh <= s2) {
      const t = (speedKmh - s1) / (s2 - s1);
      return m1 + t * (m2 - m1);
    }
  }
  return last[1];
}

/**
 * Full-detail estimator used by the UI to render pace/warning hints.
 *
 * When a plausible distance is provided for an activity with a speed→MET
 * table, we pick the higher of the pace-derived and intensity-based MET
 * values so both signals count. Otherwise we fall back to intensity alone.
 * Calories are always MET × weight (kg) × time (hours).
 */
export function estimateCaloriesBurnedDetailed(
  input: ActivityCaloriesInput,
): ActivityCaloriesDetail {
  const intensityMet = INTENSITY_MET_TABLE[input.activityType][input.intensity];
  const weight = input.weightKg && input.weightKg > 0 ? input.weightKg : DEFAULT_WEIGHT_KG;
  const durationMin = Math.max(input.durationMin, 0);
  const hours = durationMin / 60;

  const paceTable = SPEED_MET_TABLES[input.activityType];
  const distance = input.distanceKm ?? 0;
  const hasPace = paceTable != null && distance > 0 && durationMin > 0;
  const speedKmh = hasPace ? distance / hours : null;

  let met = intensityMet;
  let method: CaloriesMethod = "intensity";
  if (hasPace && speedKmh != null && paceTable) {
    const paceMet = interpolateMet(paceTable, speedKmh);
    if (paceMet > intensityMet) {
      met = paceMet;
      method = "pace";
    }
  }

  const plausibleMax = PLAUSIBLE_MAX_SPEED_KMH[input.activityType];
  const speedImplausible = speedKmh != null && plausibleMax != null && speedKmh > plausibleMax;

  return {
    calories: round(met * weight * hours, 1),
    met: round(met, 2),
    method,
    speedKmh: speedKmh != null ? round(speedKmh, 2) : null,
    speedImplausible,
  };
}

/** Convenience wrapper returning just the calorie total. */
export function estimateCaloriesBurned(input: ActivityCaloriesInput): number {
  return estimateCaloriesBurnedDetailed(input).calories;
}

export function getMetValue(activityType: ActivityType, intensity: Intensity): number {
  return INTENSITY_MET_TABLE[activityType][intensity];
}
