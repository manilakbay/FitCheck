"use client";

import { useActionState, useMemo, useState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AuthSubmitButton } from "@/features/auth/submit-button";
import { createActivityAction, type ActivityFormState } from "@/features/activity/actions";
import { ACTIVITY_TYPES, INTENSITIES } from "@/lib/constants";
import { estimateCaloriesBurned } from "@/services/activity/calories";
import type { ActivityType, Intensity } from "@/types/models";

const initialState: ActivityFormState = {};

export function ActivityForm({
  defaultDate,
  userWeightKg,
}: {
  defaultDate: string;
  userWeightKg: number | null;
}) {
  const [state, formAction] = useActionState(createActivityAction, initialState);
  const [activityType, setActivityType] = useState<ActivityType>("walking");
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [durationMin, setDurationMin] = useState<number>(30);

  const estimatedCalories = useMemo(
    () =>
      estimateCaloriesBurned({
        activityType,
        intensity,
        durationMin: Number.isFinite(durationMin) ? durationMin : 0,
        weightKg: userWeightKg,
      }),
    [activityType, intensity, durationMin, userWeightKg],
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <FormField label="Date" htmlFor="entryDate">
        <Input
          id="entryDate"
          name="entryDate"
          type="date"
          defaultValue={defaultDate}
          required
        />
      </FormField>

      <FormField label="Activity" htmlFor="activityType">
        <Select
          id="activityType"
          name="activityType"
          value={activityType}
          onChange={(event) => setActivityType(event.target.value as ActivityType)}
          required
        >
          {ACTIVITY_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Duration (minutes)" htmlFor="durationMin">
        <Input
          id="durationMin"
          name="durationMin"
          type="number"
          min={1}
          max={1440}
          required
          value={Number.isFinite(durationMin) ? durationMin : ""}
          onChange={(event) => setDurationMin(Number(event.target.value))}
        />
      </FormField>

      <FormField label="Intensity" htmlFor="intensity">
        <Select
          id="intensity"
          name="intensity"
          value={intensity}
          onChange={(event) => setIntensity(event.target.value as Intensity)}
          required
        >
          {INTENSITIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Distance (km)"
        htmlFor="distanceKm"
        hint="Optional — great for walking, running, cycling and swimming."
        className="md:col-span-2"
      >
        <Input id="distanceKm" name="distanceKm" type="number" min={0} step="0.01" />
      </FormField>

      <div className="md:col-span-2 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
        Estimated calories burned:{" "}
        <span className="font-semibold">{Math.round(estimatedCalories)} kcal</span>
        {userWeightKg == null ? (
          <p className="mt-1 text-xs text-brand-700">
            Using a 70kg default. Add your weight in your profile for a personalised estimate.
          </p>
        ) : null}
      </div>

      <div className="md:col-span-2 flex flex-col gap-3">
        {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
        <div className="flex justify-end">
          <AuthSubmitButton label="Add activity" pendingLabel="Saving…" />
        </div>
      </div>
    </form>
  );
}
