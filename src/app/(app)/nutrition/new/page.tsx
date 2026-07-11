import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { FoodEntryForm } from "@/features/nutrition/food-entry-form";
import { todayIso } from "@/lib/dates";

export const metadata = { title: "Add meal" };

export default function NewFoodEntryPage() {
  return (
    <>
      <PageHeader
        title="Add a meal"
        description="Log a food item with macros to keep your daily totals accurate."
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
            Fill in what you ate and the nutrition information from the label or database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FoodEntryForm defaultDate={todayIso()} />
        </CardContent>
      </Card>
    </>
  );
}
