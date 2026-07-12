"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  parseActivityAiAction,
  saveAiActivityAction,
} from "@/features/activity/actions";
import {
  AI_ACTIVITY_INITIAL_STATE,
  AI_ACTIVITY_SAVE_INITIAL_STATE,
  type AiActivityDraft,
} from "@/features/activity/ai-types";
import { ACTIVITY_TYPES, INTENSITIES } from "@/lib/constants";
import { estimateCaloriesBurned } from "@/services/activity/calories";
import type { ActivityType, AiConfidence, Intensity } from "@/types/models";

const EXAMPLES = [
  "45 minute morning run at moderate pace, about 6 km",
  "60 min weight training upper body, felt intense",
  "30 min brisk walk with the dog, easy pace",
];

const CONFIDENCE_TONE: Record<AiConfidence, "accent" | "warn" | "danger"> = {
  high: "accent",
  medium: "warn",
  low: "danger",
};

const CONFIDENCE_HINT: Record<AiConfidence, string> = {
  high: "Numbers look confident — the description had explicit duration and activity.",
  medium: "Some values were inferred — double-check duration and intensity before saving.",
  low: "Description was ambiguous — please review every field carefully.",
};

function ParseSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-w-[200px]">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Classifying…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" aria-hidden /> Estimate with AI
        </>
      )}
    </Button>
  );
}

function SaveSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…
        </>
      ) : (
        "Save activity"
      )}
    </Button>
  );
}

export interface AiActivityFormProps {
  defaultDate: string;
  userWeightKg: number | null;
  defaultModel: string;
}

export function AiActivityForm({
  defaultDate,
  userWeightKg,
  defaultModel,
}: AiActivityFormProps) {
  const [parseState, parseAction] = useActionState(
    parseActivityAiAction,
    AI_ACTIVITY_INITIAL_STATE,
  );
  const [saveState, saveAction] = useActionState(
    saveAiActivityAction,
    AI_ACTIVITY_SAVE_INITIAL_STATE,
  );

  const [draft, setDraft] = useState<AiActivityDraft | null>(null);
  const [entryDate, setEntryDate] = useState(defaultDate);
  const [confidence, setConfidence] = useState<AiConfidence>("medium");
  const [notes, setNotes] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (parseState.status === "success" && parseState.parsed) {
      setDraft(parseState.parsed.draft);
      setEntryDate(parseState.parsed.entryDate);
      setConfidence(parseState.parsed.confidence);
      setNotes(parseState.parsed.notes);
    }
  }, [parseState]);

  const estimatedCalories = useMemo(() => {
    if (!draft) return 0;
    return estimateCaloriesBurned({
      activityType: draft.activityType,
      intensity: draft.intensity,
      durationMin: draft.durationMin,
      weightKg: userWeightKg,
    });
  }, [draft, userWeightKg]);

  const handleReset = () => {
    setDraft(null);
    setNotes(undefined);
  };

  const updateDraft = (patch: Partial<AiActivityDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  if (!draft) {
    return (
      <form action={parseAction} className="flex flex-col gap-4">
        <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4 text-sm text-brand-900">
          <div className="flex items-center gap-2 font-semibold text-brand-800">
            <Sparkles className="h-4 w-4" aria-hidden /> Describe your workout
          </div>
          <p className="mt-1 text-xs text-brand-700">
            Type what you did in plain English. We&apos;ll ask{" "}
            <span className="font-mono">{defaultModel}</span> to classify the activity,
            duration and intensity — calories are then computed from your weight and MET
            values, not by the AI.
          </p>
        </div>

        <FormField label="Date" htmlFor="entryDate">
          <Input
            id="entryDate"
            name="entryDate"
            type="date"
            defaultValue={defaultDate}
            required
          />
        </FormField>

        <FormField
          label="What did you do?"
          htmlFor="input"
          hint="Include duration and roughly how hard it felt for the best classification."
        >
          <textarea
            id="input"
            name="input"
            required
            minLength={3}
            maxLength={1000}
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="e.g. 45 minute morning run at moderate pace, about 6 km"
          />
        </FormField>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setInput(example)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-700"
            >
              {example.length > 60 ? `${example.slice(0, 60)}…` : example}
            </button>
          ))}
        </div>

        {parseState.status === "error" && parseState.error ? (
          <FormAlert tone="error">{parseState.error}</FormAlert>
        ) : null}

        <div className="flex justify-end">
          <ParseSubmitButton />
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" className="gap-1">
              <Sparkles className="h-3 w-3" aria-hidden /> AI estimate
            </Badge>
            <Badge tone={CONFIDENCE_TONE[confidence]}>
              {confidence} confidence
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">{CONFIDENCE_HINT[confidence]}</p>
          {notes ? (
            <p className="mt-1 text-xs italic text-slate-500">Model notes: {notes}</p>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Start over
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <FormField label="Date">
          <Input
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
            required
          />
        </FormField>

        <FormField label="Activity">
          <Select
            value={draft.activityType}
            onChange={(event) =>
              updateDraft({ activityType: event.target.value as ActivityType })
            }
            required
          >
            {ACTIVITY_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Duration (minutes)">
          <Input
            type="number"
            min={1}
            max={1440}
            value={draft.durationMin}
            onChange={(event) =>
              updateDraft({ durationMin: Number(event.target.value) })
            }
            required
          />
        </FormField>

        <FormField label="Intensity">
          <Select
            value={draft.intensity}
            onChange={(event) =>
              updateDraft({ intensity: event.target.value as Intensity })
            }
            required
          >
            {INTENSITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Distance (km)"
          hint="Optional — leave blank for lifting or non-distance workouts."
          className="md:col-span-2"
        >
          <Input
            type="number"
            min={0}
            step="0.01"
            value={draft.distanceKm ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              updateDraft({
                distanceKm: value === "" ? null : Number(value),
              });
            }}
          />
        </FormField>
      </div>

      <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
        Estimated calories burned:{" "}
        <span className="font-semibold">{Math.round(estimatedCalories)} kcal</span>
        {userWeightKg == null ? (
          <p className="mt-1 text-xs text-brand-700">
            Using a 70kg default. Add your weight in your profile for a personalised estimate.
          </p>
        ) : (
          <p className="mt-1 text-xs text-brand-700">
            Computed from MET × your bodyweight ({userWeightKg} kg) × time — not by the AI.
          </p>
        )}
      </div>

      <form action={saveAction} className="flex flex-col gap-3">
        <input
          type="hidden"
          name="payload"
          value={JSON.stringify({
            entryDate,
            activityType: draft.activityType,
            durationMin: draft.durationMin,
            distanceKm: draft.distanceKm,
            intensity: draft.intensity,
            confidence,
          })}
        />
        {saveState.error ? <FormAlert tone="error">{saveState.error}</FormAlert> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={handleReset}>
            Start over
          </Button>
          <SaveSubmitButton />
        </div>
      </form>
    </div>
  );
}
