"use client";

import { useActionState } from "react";

import { AuthSubmitButton } from "@/features/auth/submit-button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  updatePreferencesAction,
  type SettingsFormState,
} from "@/app/(app)/settings/actions";
import { AI_MODELS } from "@/services/ai/types";
import type { UserAiSettingsPublic } from "@/types/models";

const initialState: SettingsFormState = {};

export function PreferencesForm({ settings }: { settings: UserAiSettingsPublic }) {
  const [state, formAction] = useActionState(updatePreferencesAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label="Model" htmlFor="prefsModel">
        <Select id="prefsModel" name="model" defaultValue={settings.model}>
          {AI_MODELS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="AI features"
        htmlFor="prefsEnabled"
        hint="When off, AI meal and activity parsing are hidden across the app."
      >
        <Select id="prefsEnabled" name="enabled" defaultValue={settings.enabled ? "true" : "false"}>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </Select>
      </FormField>

      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
      {state.success ? <FormAlert tone="success">{state.success}</FormAlert> : null}

      <div className="flex justify-end">
        <AuthSubmitButton label="Save preferences" pendingLabel="Saving…" variant="secondary" />
      </div>
    </form>
  );
}
