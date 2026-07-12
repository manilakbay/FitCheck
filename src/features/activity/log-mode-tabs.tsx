"use client";

import { Pencil, Sparkles } from "lucide-react";
import { useState } from "react";

import { Tabs } from "@/components/ui/tabs";
import { ActivityForm } from "@/features/activity/activity-form";
import { AiActivityForm } from "@/features/activity/ai-activity-form";

type Mode = "ai" | "manual";

export interface ActivityLogModeTabsProps {
  defaultDate: string;
  userWeightKg: number | null;
  aiAvailable: boolean;
  aiModel: string;
}

export function ActivityLogModeTabs({
  defaultDate,
  userWeightKg,
  aiAvailable,
  aiModel,
}: ActivityLogModeTabsProps) {
  const [mode, setMode] = useState<Mode>(aiAvailable ? "ai" : "manual");

  if (!aiAvailable) {
    return <ActivityForm defaultDate={defaultDate} userWeightKg={userWeightKg} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        ariaLabel="Activity logging mode"
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
        <AiActivityForm
          defaultDate={defaultDate}
          userWeightKg={userWeightKg}
          defaultModel={aiModel}
        />
      ) : (
        <ActivityForm defaultDate={defaultDate} userWeightKg={userWeightKg} />
      )}
    </div>
  );
}
