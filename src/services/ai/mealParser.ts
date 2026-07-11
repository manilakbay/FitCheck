import { NotImplementedError } from "@/services/ai/errors";
import type { MealParser, MealParseResult } from "@/services/ai/types";

/**
 * TODO(ai): Replace this stub with an OpenAI-backed implementation.
 *
 * Suggested approach:
 *   1. Build a system prompt describing the JSON schema (ParsedMealItem[]).
 *   2. Call chat.completions with `response_format: { type: "json_schema" }`
 *      or gpt-4o-mini for cost efficiency.
 *   3. Post-validate with zod before returning.
 *   4. Fall back to `heuristic` source for offline mode.
 */
export class StubMealParser implements MealParser {
  async parse(_input: string): Promise<MealParseResult> {
    throw new NotImplementedError("meal-parser");
  }
}

export const mealParser: MealParser = new StubMealParser();
