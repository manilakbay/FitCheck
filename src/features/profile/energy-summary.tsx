import { Activity, Flame, Salad, Target } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { formatGrams, formatKcal } from "@/lib/format";
import { estimateEnergy, hasCompleteProfile } from "@/services/profile/energy";
import type { Profile } from "@/types/models";

export function EnergySummary({ profile }: { profile: Profile | null }) {
  if (
    !profile ||
    !hasCompleteProfile({
      age: profile.age ?? undefined,
      gender: profile.gender ?? undefined,
      height_cm: profile.height_cm ?? undefined,
      weight_kg: profile.weight_kg ?? undefined,
      activity_level: profile.activity_level ?? undefined,
      goal: profile.goal ?? undefined,
    })
  ) {
    return (
      <EmptyState
        icon={Target}
        title="Complete your profile to see targets"
        description="Enter your age, gender, height, weight, activity level and goal. We'll compute BMR, TDEE, and macro targets automatically."
      />
    );
  }

  const energy = estimateEnergy({
    age: profile.age!,
    gender: profile.gender!,
    height_cm: profile.height_cm!,
    weight_kg: profile.weight_kg!,
    activity_level: profile.activity_level!,
    goal: profile.goal!,
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="BMR"
        value={formatKcal(energy.bmr)}
        hint="Basal metabolic rate"
        icon={Flame}
        tone="brand"
      />
      <StatCard
        label="TDEE"
        value={formatKcal(energy.tdee)}
        hint="Total daily energy expenditure"
        icon={Activity}
        tone="accent"
      />
      <StatCard
        label="Calorie target"
        value={formatKcal(energy.calorieTarget)}
        hint="Adjusted for your goal"
        icon={Target}
        tone="warn"
      />
      <StatCard
        label="Macro split"
        value={`${formatGrams(energy.proteinTargetG)} P`}
        hint={`${formatGrams(energy.carbsTargetG)} C · ${formatGrams(energy.fatTargetG)} F`}
        icon={Salad}
        tone="slate"
      />
    </div>
  );
}
