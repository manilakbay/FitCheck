"use client";

import { useActionState } from "react";

import { AuthSubmitButton } from "@/features/auth/submit-button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  deleteApiKeyAction,
  type SettingsFormState,
} from "@/app/(app)/settings/actions";

const initialState: SettingsFormState = {};

export function DeleteKeyForm() {
  const [state, formAction] = useActionState(deleteApiKeyAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormField
        label='Type "delete" to confirm'
        htmlFor="confirmation"
        hint="Removing your key wipes the encrypted value from our database. AI features will be disabled until you save a new key."
      >
        <Input
          id="confirmation"
          name="confirmation"
          type="text"
          autoComplete="off"
          placeholder="delete"
          spellCheck={false}
          required
        />
      </FormField>

      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
      {state.success ? <FormAlert tone="success">{state.success}</FormAlert> : null}

      <div className="flex justify-end">
        <AuthSubmitButton
          label="Remove API key"
          pendingLabel="Removing…"
          variant="destructive"
        />
      </div>
    </form>
  );
}
