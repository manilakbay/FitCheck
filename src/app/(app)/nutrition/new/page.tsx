import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { NutritionLogModeTabs } from "@/features/nutrition/log-mode-tabs";
import { todayIso } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/auth";
import { getUserAiSettingsPublic } from "@/services/ai/settings";

export const metadata = { title: "Add meal" };

export default async function NewFoodEntryPage() {
  const user = await requireUser();
  const ai = await getUserAiSettingsPublic(user.id);
  const aiAvailable = ai.hasKey && ai.enabled;

  return (
    <>
      <PageHeader
        title="Add a meal"
        description={
          aiAvailable
            ? "Describe your meal in plain English and let AI estimate calories &  macros — or log it manually."
            : "Log a food item with macros to keep your daily totals accurate."
        }
        actions={
          <Link href="/nutrition">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back
            </Button>
          </Link>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Meal details</CardTitle>
          <CardDescription>
            {aiAvailable
              ? "Pick a mode — you can always edit the numbers before saving."
              : "Fill in what you ate and the nutrition information from the label or database."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NutritionLogModeTabs
            defaultDate={todayIso()}
            aiAvailable={aiAvailable}
            aiModel={ai.model}
          />
        </CardContent>
      </Card>
    </>
  );
}
