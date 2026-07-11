"use client";

import { useActionState } from "react";

import { AuthSubmitButton } from "@/features/auth/submit-button";
import { FormAlert } from "@/components/ui/form-alert";
import {
  testStoredKeyAction,
  type SettingsFormState,
} from "@/app/(app)/settings/actions";

const initialState: SettingsFormState = {};

export function TestConnectionForm() {
  const [state, formAction] = useActionState(testStoredKeyAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
      {state.success ? <FormAlert tone="success">{state.success}</FormAlert> : null}
      <div className="flex justify-end">
        <AuthSubmitButton
          label="Test connection"
          pendingLabel="Contacting OpenAI…"
          variant="secondary"
        />
      </div>
    </form>
  );
}
