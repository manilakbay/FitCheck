"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/supabase/auth";
import { pingOpenAiKey } from "@/services/ai/client";
import { decryptSecret } from "@/services/ai/crypto";
import {
  AiApiError,
  AiKeyMissingError,
  AiRateLimitError,
} from "@/services/ai/errors";
import {
  deleteApiKey as deleteApiKeyRow,
  saveApiKey as saveApiKeyRow,
  updatePreferences,
} from "@/services/ai/settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupportedModel } from "@/services/ai/types";
import type { UserAiSettings } from "@/types/models";

export interface SettingsFormState {
  error?: string;
  success?: string;
}

function formValue(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

/**
 * Saves a new API key. The key is validated against OpenAI first — if
 * the test call fails we abort without persisting anything, so a bad
 * or revoked key can never overwrite a working one.
 */
export async function saveApiKeyAction(
  _state: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const apiKey = formValue(formData, "apiKey");
  const model = formValue(formData, "model");

  if (!apiKey.trim()) {
    return { error: "Please paste your OpenAI API key." };
  }

  try {
    await pingOpenAiKey(apiKey.trim());
  } catch (err) {
    if (err instanceof AiApiError || err instanceof AiRateLimitError) {
      return { error: err.message };
    }
    return { error: "Could not verify the API key. Please try again." };
  }

  const user = await requireUser();
  try {
    await saveApiKeyRow({
      userId: user.id,
      apiKey: apiKey.trim(),
      model: model || undefined,
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save your API key.",
    };
  }

  revalidatePath("/settings");
  return { success: "API key saved and verified with OpenAI." };
}

/**
 * Tests the currently-stored key against OpenAI without changing the
 * ciphertext. Uses the same code path that AI features use, so a green
 * check here is a real end-to-end signal.
 */
export async function testStoredKeyAction(
  _state: SettingsFormState,
  _formData: FormData,
): Promise<SettingsFormState> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_ai_settings")
    .select("api_key_ciphertext, api_key_iv, enabled")
    .eq("user_id", user.id)
    .maybeSingle();
  const row = (data as Pick<
    UserAiSettings,
    "api_key_ciphertext" | "api_key_iv" | "enabled"
  > | null) ?? null;

  if (!row || !row.api_key_ciphertext || !row.api_key_iv) {
    return { error: "No API key on file. Save one first." };
  }

  let apiKey: string;
  try {
    apiKey = decryptSecret({
      ciphertext: row.api_key_ciphertext,
      iv: row.api_key_iv,
    });
  } catch {
    return {
      error: "Could not decrypt your stored key. It may need to be re-saved.",
    };
  }

  try {
    await pingOpenAiKey(apiKey);
  } catch (err) {
    if (err instanceof AiApiError || err instanceof AiRateLimitError) {
      return { error: err.message };
    }
    return { error: "OpenAI test failed. Please try again." };
  }

  return { success: "Connection to OpenAI verified." };
}

export async function updatePreferencesAction(
  _state: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const model = formValue(formData, "model");
  const enabledRaw = formValue(formData, "enabled");
  const enabled = enabledRaw === "true";

  if (model && !isSupportedModel(model)) {
    return { error: "Unsupported model choice." };
  }

  const user = await requireUser();
  try {
    await updatePreferences({
      userId: user.id,
      model: model || undefined,
      enabled,
    });
  } catch {
    return { error: "Could not update your preferences." };
  }
  revalidatePath("/settings");
  return { success: "Preferences updated." };
}

export async function deleteApiKeyAction(
  _state: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const confirmation = formValue(formData, "confirmation");
  if (confirmation.trim().toLowerCase() !== "delete") {
    return { error: 'Type "delete" to confirm removal.' };
  }

  const user = await requireUser();
  try {
    await deleteApiKeyRow(user.id);
  } catch (err) {
    if (err instanceof AiKeyMissingError) {
      return { error: err.message };
    }
    return { error: "Could not remove your API key." };
  }
  revalidatePath("/settings");
  return { success: "API key removed. AI features are now disabled." };
}
