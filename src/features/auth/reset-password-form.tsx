"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { resetPasswordAction, type AuthFormState } from "@/features/auth/actions";
import { AuthSubmitButton } from "@/features/auth/submit-button";

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.fields?.email}
        />
      </FormField>

      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
      {state.success ? <FormAlert tone="success">{state.success}</FormAlert> : null}

      <AuthSubmitButton full label="Send reset link" pendingLabel="Sending…" />
    </form>
  );
}
