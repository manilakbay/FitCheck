"use client";

import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  parseMealAiAction,
  saveAiMealBatchAction,
} from "@/features/nutrition/actions";
import {
  AI_MEAL_INITIAL_STATE,
  AI_MEAL_SAVE_INITIAL_STATE,
  type AiParsedMealItem,
} from "@/features/nutrition/ai-types";
import { FOOD_UNITS, MEAL_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AiConfidence, MealType } from "@/types/models";

const EXAMPLES = [
  "1 cup of Greek yogurt with 100g of blueberries and a tablespoon of honey",
  "Chicken burrito bowl with brown rice, black beans, corn salsa and guac",
  "Two slices of whole-wheat toast with peanut butter and half a banana",
];

const CONFIDENCE_TONE: Record<AiConfidence, "accent" | "warn" | "danger"> = {
  high: "accent",
  medium: "warn",
  low: "danger",
};

const CONFIDENCE_HINT: Record<AiConfidence, string> = {
  high: "Numbers look confident — quantities were explicit in your description.",
  medium: "Some quantities were guessed — double-check the values before saving.",
  low: "Description was ambiguous — please review every field carefully.",
};

function ParseSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-w-[200px]">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Estimating…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" aria-hidden /> Estimate with AI
        </>
      )}
    </Button>
  );
}

function SaveSubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || count === 0}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…
        </>
      ) : (
        <>Save {count} {count === 1 ? "item" : "items"}</>
      )}
    </Button>
  );
}

export interface AiMealFormProps {
  defaultDate: string;
  defaultModel: string;
}

export function AiMealForm({ defaultDate, defaultModel }: AiMealFormProps) {
  const [parseState, parseAction] = useActionState(parseMealAiAction, AI_MEAL_INITIAL_STATE);
  const [saveState, saveAction] = useActionState(saveAiMealBatchAction, AI_MEAL_SAVE_INITIAL_STATE);

  const [items, setItems] = useState<AiParsedMealItem[]>([]);
  const [entryDate, setEntryDate] = useState(defaultDate);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [confidence, setConfidence] = useState<AiConfidence>("medium");
  const [notes, setNotes] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (parseState.status === "success" && parseState.parsed) {
      setItems(parseState.parsed.items);
      setEntryDate(parseState.parsed.entryDate);
      setMealType(parseState.parsed.mealType);
      setConfidence(parseState.parsed.confidence);
      setNotes(parseState.parsed.notes);
    }
  }, [parseState]);

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.calories += Number(item.calories) || 0;
          acc.protein += Number(item.protein_g) || 0;
          acc.carbs += Number(item.carbs_g) || 0;
          acc.fat += Number(item.fat_g) || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [items],
  );

  const showPreview = items.length > 0;

  const handleReset = () => {
    setItems([]);
    setNotes(undefined);
  };

  const updateItem = (index: number, patch: Partial<AiParsedMealItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  if (!showPreview) {
    return (
      <form action={parseAction} className="flex flex-col gap-4">
        <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4 text-sm text-brand-900">
          <div className="flex items-center gap-2 font-semibold text-brand-800">
            <Sparkles className="h-4 w-4" aria-hidden /> Describe your meal
          </div>
          <p className="mt-1 text-xs text-brand-700">
            Type what you ate in plain English. We&apos;ll ask{" "}
            <span className="font-mono">{defaultModel}</span> to break it into items with
            calories &amp; macros. Everything is editable before you save.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Date" htmlFor="entryDate">
            <Input
              id="entryDate"
              name="entryDate"
              type="date"
              defaultValue={defaultDate}
              required
            />
          </FormField>

          <FormField label="Meal" htmlFor="mealType">
            <Select id="mealType" name="mealType" defaultValue="breakfast" required>
              {MEAL_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField
          label="What did you eat?"
          htmlFor="input"
          hint="Include quantities where you can — the more specific, the better the estimate."
        >
          <textarea
            id="input"
            name="input"
            required
            minLength={3}
            maxLength={2000}
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="e.g. 200g grilled chicken, 1 cup rice and a big spoon of olive oil"
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
        <FormField label="Meal">
          <Select
            value={mealType}
            onChange={(event) => setMealType(event.target.value as MealType)}
            required
          >
            {MEAL_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <FormField label="Food" className="flex-1">
                <Input
                  value={item.foodName}
                  onChange={(event) => updateItem(index, { foodName: event.target.value })}
                  required
                  maxLength={200}
                />
              </FormField>
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label={`Remove ${item.foodName}`}
                className="mt-7 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-6">
              <FormField label="Quantity" className="sm:col-span-2">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, { quantity: Number(event.target.value) })
                  }
                  required
                />
              </FormField>
              <FormField label="Unit" className="sm:col-span-2">
                <Select
                  value={item.unit}
                  onChange={(event) =>
                    updateItem(index, {
                      unit: event.target.value as (typeof FOOD_UNITS)[number],
                    })
                  }
                  required
                >
                  {FOOD_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Calories" className="sm:col-span-2">
                <Input
                  type="number"
                  min={0}
                  step="1"
                  value={item.calories}
                  onChange={(event) =>
                    updateItem(index, { calories: Number(event.target.value) })
                  }
                  required
                />
              </FormField>
              <FormField label="Protein (g)" className="sm:col-span-2">
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={item.protein_g}
                  onChange={(event) =>
                    updateItem(index, { protein_g: Number(event.target.value) })
                  }
                />
              </FormField>
              <FormField label="Carbs (g)" className="sm:col-span-2">
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={item.carbs_g}
                  onChange={(event) =>
                    updateItem(index, { carbs_g: Number(event.target.value) })
                  }
                />
              </FormField>
              <FormField label="Fat (g)" className="sm:col-span-2">
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={item.fat_g}
                  onChange={(event) =>
                    updateItem(index, { fat_g: Number(event.target.value) })
                  }
                />
              </FormField>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
        <div>
          <div className="font-semibold">Meal totals</div>
          <div className="text-xs text-brand-700">
            {Math.round(totals.calories)} kcal · P {totals.protein.toFixed(1)}g · C{" "}
            {totals.carbs.toFixed(1)}g · F {totals.fat.toFixed(1)}g
          </div>
        </div>
        <div className={cn("text-xs text-brand-700")}>
          Everything below is editable before saving.
        </div>
      </div>

      <form action={saveAction} className="flex flex-col gap-3">
        <input
          type="hidden"
          name="payload"
          value={JSON.stringify({
            entryDate,
            mealType,
            confidence,
            items,
          })}
        />
        {saveState.error ? <FormAlert tone="error">{saveState.error}</FormAlert> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={handleReset}>
            Start over
          </Button>
          <SaveSubmitButton count={items.length} />
        </div>
      </form>
    </div>
  );
}
