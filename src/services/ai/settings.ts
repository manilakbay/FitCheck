import "server-only";

import { format, parseISO } from "date-fns";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AiKeyMissingError, AiRateLimitError } from "@/services/ai/errors";
import { decryptSecret, encryptSecret, keyLast4 } from "@/services/ai/crypto";
import { isSupportedModel } from "@/services/ai/types";
import type {
  AiProvider,
  UserAiSettings,
  UserAiSettingsPublic,
} from "@/types/models";

const MONTHLY_REQUEST_LIMIT = 3_000;
const DAILY_REQUEST_LIMIT = 100;
const PER_MINUTE_LIMIT = 10;

const perUserMinuteBuckets = new Map<string, { windowStart: number; count: number }>();

function toPublic(row: UserAiSettings | null): UserAiSettingsPublic {
  return {
    provider: (row?.provider as AiProvider | undefined) ?? "openai",
    model: row?.model ?? "gpt-4o-mini",
    enabled: row?.enabled ?? true,
    hasKey: Boolean(row?.api_key_ciphertext && row?.api_key_iv),
    apiKeyLast4: row?.api_key_last4 ?? null,
    monthlyRequestCount: row?.monthly_request_count ?? 0,
    monthlyRequestReset:
      row?.monthly_request_reset ?? format(new Date(), "yyyy-MM-dd"),
    updatedAt: row?.updated_at ?? new Date().toISOString(),
  };
}

/** Read a user's AI settings and project to a redacted, client-safe shape. */
export async function getUserAiSettingsPublic(userId: string): Promise<UserAiSettingsPublic> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_ai_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return toPublic((data as UserAiSettings | null) ?? null);
}

/** Loads the raw row for internal usage. Never return this to the client. */
async function getUserAiSettingsRaw(userId: string): Promise<UserAiSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_ai_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as UserAiSettings | null) ?? null;
}

export interface SaveApiKeyInput {
  userId: string;
  apiKey: string;
  model?: string;
  enabled?: boolean;
}

/**
 * Encrypts and persists an API key. If a row already exists, only the
 * key material fields are rewritten; model/enabled preferences can be
 * updated in the same call.
 */
export async function saveApiKey({
  userId,
  apiKey,
  model,
  enabled,
}: SaveApiKeyInput): Promise<UserAiSettingsPublic> {
  const trimmed = apiKey.trim();
  if (!trimmed.startsWith("sk-") || trimmed.length < 20) {
    throw new Error("That doesn't look like an OpenAI API key (should start with sk-).");
  }
  const { ciphertext, iv } = encryptSecret(trimmed);

  const supabase = await createSupabaseServerClient();
  const existing = await getUserAiSettingsRaw(userId);

  const nextModel = model && isSupportedModel(model) ? model : existing?.model ?? "gpt-4o-mini";
  const nextEnabled = enabled ?? existing?.enabled ?? true;

  if (existing) {
    const { error } = await supabase
      .from("user_ai_settings")
      .update({
        api_key_ciphertext: ciphertext,
        api_key_iv: iv,
        api_key_last4: keyLast4(trimmed),
        model: nextModel,
        enabled: nextEnabled,
      })
      .eq("user_id", userId);
    if (error) throw new Error("Could not save your API key. Please try again.");
  } else {
    const { error } = await supabase.from("user_ai_settings").insert({
      user_id: userId,
      provider: "openai",
      model: nextModel,
      enabled: nextEnabled,
      api_key_ciphertext: ciphertext,
      api_key_iv: iv,
      api_key_last4: keyLast4(trimmed),
    });
    if (error) throw new Error("Could not save your API key. Please try again.");
  }

  return getUserAiSettingsPublic(userId);
}

export async function updatePreferences({
  userId,
  model,
  enabled,
}: {
  userId: string;
  model?: string;
  enabled?: boolean;
}): Promise<UserAiSettingsPublic> {
  const supabase = await createSupabaseServerClient();

  const validModel = typeof model === "string" && isSupportedModel(model) ? model : undefined;
  const validEnabled = typeof enabled === "boolean" ? enabled : undefined;

  if (validModel === undefined && validEnabled === undefined) {
    return getUserAiSettingsPublic(userId);
  }

  const existing = await getUserAiSettingsRaw(userId);
  if (existing) {
    const patch: { model?: string; enabled?: boolean } = {};
    if (validModel !== undefined) patch.model = validModel;
    if (validEnabled !== undefined) patch.enabled = validEnabled;
    const { error } = await supabase.from("user_ai_settings").update(patch).eq("user_id", userId);
    if (error) throw new Error("Could not update your preferences.");
  } else {
    const { error } = await supabase.from("user_ai_settings").insert({
      user_id: userId,
      provider: "openai",
      model: validModel ?? "gpt-4o-mini",
      enabled: validEnabled ?? true,
    });
    if (error) throw new Error("Could not update your preferences.");
  }
  return getUserAiSettingsPublic(userId);
}

export async function deleteApiKey(userId: string): Promise<UserAiSettingsPublic> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_ai_settings")
    .update({
      api_key_ciphertext: null,
      api_key_iv: null,
      api_key_last4: null,
    })
    .eq("user_id", userId);
  if (error) throw new Error("Could not remove your API key.");
  return getUserAiSettingsPublic(userId);
}

/**
 * Fetches and decrypts the stored key, then bumps rate-limit counters
 * inside the same call. Throws {@link AiKeyMissingError} or
 * {@link AiRateLimitError} on failure so callers can render a helpful
 * message. The plaintext key never crosses back to the browser — it
 * lives only inside the server action that made the call.
 */
export interface AuthorizedAiSession {
  apiKey: string;
  model: string;
}

export async function acquireAiSession(userId: string): Promise<AuthorizedAiSession> {
  const row = await getUserAiSettingsRaw(userId);
  if (!row || !row.enabled) {
    throw new AiKeyMissingError("AI is disabled or no key has been saved yet.");
  }
  if (!row.api_key_ciphertext || !row.api_key_iv) {
    throw new AiKeyMissingError();
  }

  const today = new Date();
  const todayIso = format(today, "yyyy-MM-dd");
  const resetIso = row.monthly_request_reset;
  const shouldReset =
    resetIso.length !== todayIso.length ||
    parseISO(resetIso).getUTCMonth() !== today.getUTCMonth() ||
    parseISO(resetIso).getUTCFullYear() !== today.getUTCFullYear();

  const currentCount = shouldReset ? 0 : row.monthly_request_count;
  if (currentCount >= MONTHLY_REQUEST_LIMIT) {
    throw new AiRateLimitError("daily");
  }
  if (currentCount >= DAILY_REQUEST_LIMIT) {
    throw new AiRateLimitError("daily");
  }

  const now = Date.now();
  const bucket = perUserMinuteBuckets.get(userId);
  if (bucket && now - bucket.windowStart < 60_000) {
    if (bucket.count >= PER_MINUTE_LIMIT) {
      throw new AiRateLimitError("per-minute", 60_000 - (now - bucket.windowStart));
    }
    bucket.count += 1;
  } else {
    perUserMinuteBuckets.set(userId, { windowStart: now, count: 1 });
  }

  const apiKey = decryptSecret({
    ciphertext: row.api_key_ciphertext,
    iv: row.api_key_iv,
  });

  const supabase = await createSupabaseServerClient();
  const nextCount = currentCount + 1;
  await supabase
    .from("user_ai_settings")
    .update({
      monthly_request_count: nextCount,
      monthly_request_reset: shouldReset ? todayIso : row.monthly_request_reset,
    })
    .eq("user_id", userId);

  return { apiKey, model: row.model };
}

export const AI_LIMITS = {
  monthlyRequestLimit: MONTHLY_REQUEST_LIMIT,
  dailyRequestLimit: DAILY_REQUEST_LIMIT,
  perMinuteLimit: PER_MINUTE_LIMIT,
};
