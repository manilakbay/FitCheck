"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AuthSubmitButton } from "@/features/auth/submit-button";
import { saveProfileAction, type ProfileFormState } from "@/features/profile/actions";
import { ACTIVITY_LEVELS, GENDERS, GOALS } from "@/lib/constants";
import type { Profile, DailyGoal } from "@/types/models";

const initialState: ProfileFormState = {};

export interface ProfileFormProps {
  profile: Profile | null;
  goal: DailyGoal | null;
}

export function ProfileForm({ profile, goal }: ProfileFormProps) {
  const [state, formAction] = useActionState(saveProfileAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <FormField label="Full name" htmlFor="fullName" className="md:col-span-2">
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={profile?.full_name ?? ""}
          placeholder="e.g. Alex Morgan"
        />
      </FormField>

      <FormField label="Age" htmlFor="age">
        <Input
          id="age"
          name="age"
          type="number"
          min={10}
          max={120}
          required
          defaultValue={profile?.age ?? ""}
        />
      </FormField>

      <FormField label="Gender" htmlFor="gender">
        <Select id="gender" name="gender" defaultValue={profile?.gender ?? ""} required>
          <option value="" disabled>
            Select…
          </option>
          {GENDERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Height (cm)" htmlFor="heightCm">
        <Input
          id="heightCm"
          name="heightCm"
          type="number"
          step="0.1"
          min={50}
          max={272}
          required
          defaultValue={profile?.height_cm ?? ""}
        />
      </FormField>

      <FormField label="Weight (kg)" htmlFor="weightKg">
        <Input
          id="weightKg"
          name="weightKg"
          type="number"
          step="0.1"
          min={20}
          max={500}
          required
          defaultValue={profile?.weight_kg ?? ""}
        />
      </FormField>

      <FormField label="Activity level" htmlFor="activityLevel" className="md:col-span-2">
        <Select
          id="activityLevel"
          name="activityLevel"
          defaultValue={profile?.activity_level ?? ""}
          required
        >
          <option value="" disabled>
            Select…
          </option>
          {ACTIVITY_LEVELS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} — {option.description}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Goal" htmlFor="goal">
        <Select id="goal" name="goal" defaultValue={profile?.goal ?? ""} required>
          <option value="" disabled>
            Select…
          </option>
          {GOALS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Goal weight (kg)" htmlFor="goalWeightKg" hint="Optional target weight.">
        <Input
          id="goalWeightKg"
          name="goalWeightKg"
          type="number"
          step="0.1"
          min={20}
          max={500}
          defaultValue={goal?.goal_weight_kg ?? ""}
        />
      </FormField>

      <div className="md:col-span-2 flex flex-col gap-3">
        {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
        {state.success ? <FormAlert tone="success">{state.success}</FormAlert> : null}
        <div className="flex justify-end">
          <AuthSubmitButton label="Save profile" pendingLabel="Saving…" />
        </div>
      </div>
    </form>
  );
}
