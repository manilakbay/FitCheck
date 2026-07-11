"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signInAction, type AuthFormState } from "@/features/auth/actions";
import { AuthSubmitButton } from "@/features/auth/submit-button";

const initialState: AuthFormState = {};

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

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

      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>

      <div className="flex items-center justify-end text-sm">
        <Link className="text-brand-600 hover:underline" href="/reset-password">
          Forgot password?
        </Link>
      </div>

      {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}

      <AuthSubmitButton full label="Sign in" pendingLabel="Signing in…" />
    </form>
  );
}
