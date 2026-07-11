import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Service-role client. Only usable in server contexts. Bypasses RLS, so use
 * sparingly (admin utilities, back-office jobs, scheduled tasks).
 */
export function createSupabaseAdminClient() {
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to your environment before calling this helper.",
    );
  }

  return createClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
