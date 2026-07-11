import { NotImplementedError } from "@/services/ai/errors";
import type { ActivityParser, ActivityParseResult } from "@/services/ai/types";

/**
 * TODO(ai): Replace this stub with an OpenAI-backed implementation.
 *
 * Suggested approach:
 *   1. Prompt the model to return an array of {activityType, durationMin,
 *      distanceKm?, intensity} objects.
 *   2. Use zod to validate the enum values.
 *   3. Post-process with `estimateCaloriesBurned` when the LLM omits the
 *      calorie estimate.
 */
export class StubActivityParser implements ActivityParser {
  async parse(_input: string): Promise<ActivityParseResult> {
    throw new NotImplementedError("activity-parser");
  }
}

export const activityParser: ActivityParser = new StubActivityParser();
