import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityForm } from "@/features/activity/activity-form";
import { getProfileAndGoals } from "@/features/profile/queries";
import { requireUser } from "@/lib/supabase/auth";
import { todayIso } from "@/lib/dates";

export const metadata = { title: "Add activity" };

export default async function NewActivityPage() {
  const user = await requireUser();
  const { profile } = await getProfileAndGoals(user.id);
  const weightKg = profile?.weight_kg ? Number(profile.weight_kg) : null;

  return (
    <>
      <PageHeader
        title="Add an activity"
        description="Estimate calories burned using MET × your bodyweight × time."
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
            Pick the activity, duration, and intensity — the calorie estimate updates as you type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityForm defaultDate={todayIso()} userWeightKg={weightKg} />
        </CardContent>
      </Card>
    </>
  );
}
