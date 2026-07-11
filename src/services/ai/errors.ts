/**
 * Typed error hierarchy for the AI service layer. Each error should be
 * safe to bubble to a user-facing message without leaking secrets — no
 * error message includes the API key, ciphertext, or raw model output.
 */

export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`AI feature "${feature}" is not implemented yet.`);
    this.name = "NotImplementedError";
  }
}

/** No API key on file or explicitly disabled by the user. */
export class AiKeyMissingError extends Error {
  constructor(message = "No AI provider API key configured.") {
    super(message);
    this.name = "AiKeyMissingError";
  }
}

/** Provider returned a 4xx/5xx that isn't a rate limit. */
export class AiApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "AiApiError";
    this.status = status;
    this.code = code;
  }
}

/** Local or upstream rate-limit exceeded. */
export class AiRateLimitError extends Error {
  retryAfterMs?: number;
  scope: "daily" | "per-minute" | "provider";
  constructor(scope: "daily" | "per-minute" | "provider", retryAfterMs?: number) {
    super(
      scope === "provider"
        ? "OpenAI rate limit reached. Try again shortly."
        : scope === "daily"
          ? "Daily AI request limit reached. Try again tomorrow."
          : "Too many AI requests this minute. Please slow down.",
    );
    this.name = "AiRateLimitError";
    this.scope = scope;
    this.retryAfterMs = retryAfterMs;
  }
}

/** Structured Outputs response failed Zod validation. */
export class AiSchemaError extends Error {
  constructor(message = "The AI returned an unexpected response shape.") {
    super(message);
    this.name = "AiSchemaError";
  }
}
