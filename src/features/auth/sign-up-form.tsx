"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signUpAction, type AuthFormState } from "@/features/auth/actions";
import { AuthSubmitButton } from "@/features/auth/submit-button";

const initialState: AuthFormState = {};

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Full name" htmlFor="fullName" hint="Optional — you can add this later.">
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={state.fields?.fullName}
        />
      </FormField>

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

      <FormField label="Password" htmlFor="password" hint="At least 8 characters.">
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
      {state.success ? <FormAlert tone="success">{state.success}</FormAlert> : null}

      <AuthSubmitButton full label="Create account" pendingLabel="Creating account…" />
    </form>
  );
}
