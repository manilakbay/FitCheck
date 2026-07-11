"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updatePasswordAction, type AuthFormState } from "@/features/auth/actions";
import { AuthSubmitButton } from "@/features/auth/submit-button";

const initialState: AuthFormState = {};

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="New password" htmlFor="password" hint="At least 8 characters.">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </FormField>

      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}

      <AuthSubmitButton full label="Save new password" pendingLabel="Saving…" />
    </form>
  );
}
