import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { EnergySummary } from "@/features/profile/energy-summary";
import { ProfileForm } from "@/features/profile/profile-form";
import { getProfileAndGoals } from "@/features/profile/queries";
import { requireUser } from "@/lib/supabase/auth";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const { profile, goal } = await getProfileAndGoals(user.id);

  return (
    <>
      <PageHeader
        title="Your profile"
        description="Personal details drive your BMR, TDEE and daily calorie target."
      />

      <EnergySummary profile={profile} />

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            Saving updates your daily goals and logs today&apos;s weight.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} goal={goal} />
        </CardContent>
      </Card>
    </>
  );
}
