import "server-only";

import { structuredCompletion } from "@/services/ai/client";
import { acquireAiSession } from "@/services/ai/settings";
import {
  ActivityParseSchema,
  type ActivityParseContext,
  type ActivityParseResult,
  type ActivityParser,
  type ParsedActivity,
} from "@/services/ai/types";

const SYSTEM_PROMPT = `You extract structured workout data from natural-language descriptions.

Rules:
- Pick the single best-matching \`activity_type\` from the enum. Never invent new categories.
- Use minutes for duration. If the user gave a range, take the midpoint.
- Only set \`distance_km\` if the description mentions distance. Convert imperial units to km (1 mi ≈ 1.609 km).
- Choose \`intensity\` from ("low", "moderate", "high") based on effort cues in the description.
- Set \`confidence\` to "high" only when duration and activity type are explicit; "medium" if inferred; "low" if either is ambiguous.
- DO NOT estimate calories. Calories are computed separately by the application from the user's profile weight and pace.
- Never include markdown or prose outside the JSON.`;

export class OpenAiActivityParser implements ActivityParser {
  async parse(input: string, context: ActivityParseContext): Promise<ActivityParseResult> {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      throw new Error("Please describe your workout.");
    }
    if (trimmed.length > 1000) {
      throw new Error("Workout description is too long — keep it under 1000 characters.");
    }

    const { apiKey, model } = await acquireAiSession(context.userId);

    const profile = context.profile;
    const profileHint = [
      profile.weightKg ? `weight ${profile.weightKg} kg` : null,
      profile.age ? `age ${profile.age}` : null,
      profile.gender ? `gender ${profile.gender}` : null,
      profile.activityLevel ? `baseline activity ${profile.activityLevel}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const userPrompt = [
      profileHint ? `User profile: ${profileHint}.` : "User profile: (not provided).",
      `Workout description: """${trimmed.replace(/"""/g, "'''")}"""`,
      "Return the parsed activity as JSON.",
    ].join("\n");

    const raw = await structuredCompletion({
      apiKey,
      model,
      system: SYSTEM_PROMPT,
      user: userPrompt,
      schema: ActivityParseSchema,
      schemaName: "activity_parse_v1",
      maxTokens: 400,
    });

    const activity: ParsedActivity = {
      activityType: raw.activity_type,
      durationMin: raw.duration_min,
      distanceKm: raw.distance_km ?? null,
      intensity: raw.intensity,
      confidence: raw.confidence,
      notes: raw.notes,
    };

    return { activity, raw: JSON.stringify(raw) };
  }
}

export const activityParser: ActivityParser = new OpenAiActivityParser();
