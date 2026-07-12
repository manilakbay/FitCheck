import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityLogModeTabs } from "@/features/activity/log-mode-tabs";
import { getProfileAndGoals } from "@/features/profile/queries";
import { requireUser } from "@/lib/supabase/auth";
import { todayIso } from "@/lib/dates";
import { getUserAiSettingsPublic } from "@/services/ai/settings";

export const metadata = { title: "Add activity" };

export default async function NewActivityPage() {
  const user = await requireUser();
  const [{ profile }, ai] = await Promise.all([
    getProfileAndGoals(user.id),
    getUserAiSettingsPublic(user.id),
  ]);
  const weightKg = profile?.weight_kg ? Number(profile.weight_kg) : null;
  const aiAvailable = ai.hasKey && ai.enabled;

  return (
    <>
      <PageHeader
        title="Add an activity"
        description={
          aiAvailable
            ? "Describe your workout in plain English — AI classifies, we compute the calories from your weight."
            : "Estimate calories burned using MET × your bodyweight × time."
        }
        actions={
          <Link href="/activity">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back
            </Button>
          </Link>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Activity details</CardTitle>
          <CardDescription>
            {aiAvailable
              ? "Pick a mode — you can always edit every field before saving."
              : "Pick the activity, duration, and intensity — the calorie estimate updates as you type."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLogModeTabs
            defaultDate={todayIso()}
            userWeightKg={weightKg}
            aiAvailable={aiAvailable}
            aiModel={ai.model}
          />
        </CardContent>
      </Card>
    </>
  );
}
