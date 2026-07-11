import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  /**
   * 32 raw bytes (44 base64 chars) used to AES-256-GCM encrypt per-user
   * AI provider API keys before they hit the database. Never expose to
   * the browser. Set with:  openssl rand -base64 32
   */
  AI_ENCRYPTION_KEY: z
    .string()
    .refine((value) => {
      try {
        return Buffer.from(value, "base64").length === 32;
      } catch {
        return false;
      }
    }, "AI_ENCRYPTION_KEY must be 32 raw bytes encoded as base64 (44 chars).")
    .optional(),
});

const rawPublic = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

const rawServer = {
  ...rawPublic,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  AI_ENCRYPTION_KEY: process.env.AI_ENCRYPTION_KEY,
};

function parseOrPlaceholders<T extends z.ZodTypeAny>(schema: T, raw: unknown): z.infer<T> {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;

  const isBuild =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.CI === "true";

  if (isBuild) {
    return schema.parse({
      NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder-anon-key",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      AI_ENCRYPTION_KEY: Buffer.alloc(32).toString("base64"),
    });
  }

  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
  );
}

export const publicEnv = parseOrPlaceholders(publicSchema, rawPublic);
export const serverEnv = parseOrPlaceholders(serverSchema, rawServer);

export const siteUrl =
  publicEnv.NEXT_PUBLIC_SITE_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
