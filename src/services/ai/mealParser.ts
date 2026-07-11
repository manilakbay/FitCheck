import "server-only";

import { structuredCompletion } from "@/services/ai/client";
import { acquireAiSession } from "@/services/ai/settings";
import {
  MealParseSchema,
  type MealParseContext,
  type MealParseResult,
  type MealParser,
  type ParsedMealItem,
} from "@/services/ai/types";

const SYSTEM_PROMPT = `You estimate calories and macronutrients from natural-language food descriptions.

Rules:
- Return one item per distinct food component. Do not merge separate ingredients.
- Use standard USDA reference values as your base.
- If a quantity or unit is missing, assume ONE typical serving of that food and note it in \`notes\`.
- Choose the most specific matching \`unit\` from the enum. Prefer "g" or "ml" when a mass or volume is stated.
- Round calories to the nearest whole number and macros to one decimal.
- Set \`confidence\` to "high" only if quantities and units were explicitly stated; "medium" if you had to infer serving sizes; "low" if the description was ambiguous.
- Never include markdown, prose, or commentary outside the JSON.`;

export class OpenAiMealParser implements MealParser {
  async parse(input: string, context: MealParseContext): Promise<MealParseResult> {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      throw new Error("Please describe what you ate.");
    }
    if (trimmed.length > 2000) {
      throw new Error("Meal description is too long — keep it under 2000 characters.");
    }

    const { apiKey, model } = await acquireAiSession(context.userId);

    const userPrompt = [
      `Meal description: """${trimmed.replace(/"""/g, "'''")}"""`,
      context.mealType ? `Meal type hint: ${context.mealType}` : "Meal type hint: (unknown)",
      "Return the parsed items as JSON.",
    ].join("\n");

    const raw = await structuredCompletion({
      apiKey,
      model,
      system: SYSTEM_PROMPT,
      user: userPrompt,
      schema: MealParseSchema,
      schemaName: "meal_parse_v1",
      maxTokens: 900,
    });

    const items: ParsedMealItem[] = raw.items.map((item) => ({
      foodName: item.food_name,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
    }));

    return {
      items,
      confidence: raw.confidence,
      mealType: context.mealType,
      notes: raw.notes,
      raw: JSON.stringify(raw),
    };
  }
}

export const mealParser: MealParser = new OpenAiMealParser();
