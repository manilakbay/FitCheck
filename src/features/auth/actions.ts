"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { siteUrl } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  next: z.string().optional(),
});

const signUpSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().trim().max(120).optional(),
});

const resetSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface AuthFormState {
  error?: string;
  success?: string;
  fields?: Record<string, string>;
}

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseNextParam(input: string | undefined): string | undefined {
  if (!input) return undefined;
  if (!input.startsWith("/") || input.startsWith("//")) return undefined;
  return input;
}

export async function signInAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    next: formValue(formData, "next"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      error: flat.email?.[0] ?? flat.password?.[0] ?? "Invalid input",
      fields: { email: formValue(formData, "email") },
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message,
      fields: { email: parsed.data.email },
    };
  }

  revalidatePath("/", "layout");
  redirect(parseNextParam(parsed.data.next) ?? "/dashboard");
}

export async function signUpAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    fullName: formValue(formData, "fullName"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      error: flat.email?.[0] ?? flat.password?.[0] ?? flat.fullName?.[0] ?? "Invalid input",
      fields: {
        email: formValue(formData, "email"),
        fullName: formValue(formData, "fullName"),
      },
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: parsed.data.fullName ? { full_name: parsed.data.fullName } : undefined,
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message,
      fields: {
        email: parsed.data.email,
        fullName: parsed.data.fullName ?? "",
      },
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/profile");
  }

  return {
    success:
      "Check your inbox — we sent you a confirmation email. Once confirmed you can sign in.",
    fields: { email: parsed.data.email },
  };
}

export async function resetPasswordAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse({ email: formValue(formData, "email") });
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email",
      fields: { email: formValue(formData, "email") },
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/update-password`,
  });

  if (error) {
    return { error: error.message, fields: { email: parsed.data.email } };
  }

  return {
    success:
      "If an account exists for that email, we've sent a password reset link. Check your inbox.",
    fields: { email: parsed.data.email },
  };
}

export async function updatePasswordAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = updatePasswordSchema.safeParse({ password: formValue(formData, "password") });
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.password?.[0] ?? "Invalid password",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}
