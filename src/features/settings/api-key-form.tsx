"use client";

import { useActionState } from "react";

import { AuthSubmitButton } from "@/features/auth/submit-button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { saveApiKeyAction, type SettingsFormState } from "@/app/(app)/settings/actions";
import { AI_MODELS } from "@/services/ai/types";
import type { UserAiSettingsPublic } from "@/types/models";

const initialState: SettingsFormState = {};

export function ApiKeyForm({ settings }: { settings: UserAiSettingsPublic }) {
  const [state, formAction] = useActionState(saveApiKeyAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField
        label="OpenAI API key"
        htmlFor="apiKey"
        hint={
          settings.hasKey && settings.apiKeyLast4
            ? `A key ending in "${settings.apiKeyLast4}" is on file. Paste a new one here to rotate it.`
            : "Get a key from platform.openai.com. It's encrypted at rest and never shown again."
        }
      >
        <Input
          id="apiKey"
          name="apiKey"
          type="password"
          autoComplete="off"
          placeholder="sk-..."
          spellCheck={false}
          required
        />
      </FormField>

      <FormField label="Model" htmlFor="model" hint="Used for meal and activity parsing.">
        <Select id="model" name="model" defaultValue={settings.model}>
          {AI_MODELS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </FormField>

      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
      {state.success ? <FormAlert tone="success">{state.success}</FormAlert> : null}

      <div className="flex justify-end">
        <AuthSubmitButton label="Test & save key" pendingLabel="Testing with OpenAI…" />
      </div>
    </form>
  );
}
