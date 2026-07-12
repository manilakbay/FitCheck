import type { ActivityType, AiConfidence, Intensity } from "@/types/models";

export type AiActivityDraft = {
  activityType: ActivityType;
  durationMin: number;
  distanceKm: number | null;
  intensity: Intensity;
};

export interface AiActivityParseState {
  status: "idle" | "success" | "error";
  error?: string;
  parsed?: {
    input: string;
    entryDate: string;
    draft: AiActivityDraft;
    confidence: AiConfidence;
    notes?: string;
  };
}

export const AI_ACTIVITY_INITIAL_STATE: AiActivityParseState = { status: "idle" };

export interface AiActivitySaveState {
  error?: string;
  success?: string;
}

export const AI_ACTIVITY_SAVE_INITIAL_STATE: AiActivitySaveState = {};
