"use client";

import { Pencil, Sparkles } from "lucide-react";
import { useState } from "react";

import { Tabs } from "@/components/ui/tabs";
import { AiMealForm } from "@/features/nutrition/ai-meal-form";
import { FoodEntryForm } from "@/features/nutrition/food-entry-form";

type Mode = "ai" | "manual";

export interface NutritionLogModeTabsProps {
  defaultDate: string;
  aiAvailable: boolean;
  aiModel: string;
}

export function NutritionLogModeTabs({
  defaultDate,
  aiAvailable,
  aiModel,
}: NutritionLogModeTabsProps) {
  const [mode, setMode] = useState<Mode>(aiAvailable ? "ai" : "manual");

  if (!aiAvailable) {
    return <FoodEntryForm defaultDate={defaultDate} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        ariaLabel="Meal logging mode"
        active={mode}
        onChange={(id) => setMode(id as Mode)}
        tabs={[
          {
            id: "ai",
            label: "AI describe",
            icon: <Sparkles className="h-3.5 w-3.5" aria-hidden />,
          },
          {
            id: "manual",
            label: "Manual",
            icon: <Pencil className="h-3.5 w-3.5" aria-hidden />,
          },
        ]}
      />
      {mode === "ai" ? (
        <AiMealForm defaultDate={defaultDate} defaultModel={aiModel} />
      ) : (
        <FoodEntryForm defaultDate={defaultDate} />
      )}
    </div>
  );
}
