import "server-only";

import type { z } from "zod";
import { zodToJsonSchema } from "@/services/ai/zod-to-json-schema";

import { AiApiError, AiRateLimitError, AiSchemaError } from "@/services/ai/errors";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_TOKENS = 800;

export interface StructuredCompletionInput<T extends z.ZodTypeAny> {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  schema: T;
  schemaName: string;
  maxTokens?: number;
  timeoutMs?: number;
  temperature?: number;
}

/**
 * Calls OpenAI's chat completions API with strict Structured Outputs.
 * The response is guaranteed to match the provided Zod schema (validated
 * client-side too as a defensive check). Timeout, max_tokens and error
 * classification are handled here so callers only need to await.
 */
export async function structuredCompletion<T extends z.ZodTypeAny>(
  input: StructuredCompletionInput<T>,
): Promise<z.infer<T>> {
  const {
    apiKey,
    model,
    system,
    user,
    schema,
    schemaName,
    maxTokens = DEFAULT_MAX_TOKENS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    temperature = 0.2,
  } = input;

  const jsonSchema = zodToJsonSchema(schema);
  const body = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: schemaName,
        strict: true,
        schema: jsonSchema,
      },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new AiApiError(408, "OpenAI request timed out. Please try again.");
    }
    throw new AiApiError(0, "Could not reach OpenAI. Check your internet connection.");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AiApiError(response.status, "Your OpenAI API key was rejected. Update it in Settings.");
  }
  if (response.status === 429) {
    throw new AiRateLimitError("provider");
  }
  if (!response.ok) {
    throw new AiApiError(response.status, `OpenAI returned an error (${response.status}).`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = payload.choices?.[0]?.message?.content;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new AiSchemaError("OpenAI returned an empty response.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new AiSchemaError("OpenAI returned invalid JSON.");
  }

  const validated = schema.safeParse(parsedJson);
  if (!validated.success) {
    throw new AiSchemaError("OpenAI response failed schema validation.");
  }
  return validated.data;
}

/**
 * Lightweight liveness check used by the settings page's "Test key"
 * button. Just calls /v1/models and treats a 200 as success. Uses a
 * short timeout so a misconfigured key doesn't hang the UI.
 */
export async function pingOpenAiKey(apiKey: string, timeoutMs = 8_000): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(OPENAI_MODELS_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new AiApiError(408, "OpenAI request timed out.");
    }
    throw new AiApiError(0, "Could not reach OpenAI.");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AiApiError(response.status, "That API key was rejected by OpenAI.");
  }
  if (response.status === 429) {
    throw new AiRateLimitError("provider");
  }
  if (!response.ok) {
    throw new AiApiError(response.status, `OpenAI returned ${response.status}.`);
  }
}
