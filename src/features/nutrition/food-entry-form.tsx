"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AuthSubmitButton } from "@/features/auth/submit-button";
import {
  createFoodEntryAction,
  type FoodFormState,
} from "@/features/nutrition/actions";
import { FOOD_UNITS, MEAL_TYPES } from "@/lib/constants";

const initialState: FoodFormState = {};

export function FoodEntryForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction] = useActionState(createFoodEntryAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
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

      <FormField label="Food name" htmlFor="foodName" className="md:col-span-2">
        <Input
          id="foodName"
          name="foodName"
          type="text"
          maxLength={200}
          required
          placeholder="e.g. Greek yogurt with berries"
        />
      </FormField>

      <FormField label="Quantity" htmlFor="quantity">
        <Input
          id="quantity"
          name="quantity"
          type="number"
          step="0.01"
          min={0}
          required
          defaultValue={1}
        />
      </FormField>

      <FormField label="Unit" htmlFor="unit">
        <Select id="unit" name="unit" defaultValue="serving" required>
          {FOOD_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Calories (kcal)" htmlFor="calories">
        <Input
          id="calories"
          name="calories"
          type="number"
          step="1"
          min={0}
          required
        />
      </FormField>

      <FormField label="Protein (g)" htmlFor="protein">
        <Input
          id="protein"
          name="protein"
          type="number"
          step="0.1"
          min={0}
          defaultValue={0}
          required
        />
      </FormField>

      <FormField label="Carbs (g)" htmlFor="carbs">
        <Input
          id="carbs"
          name="carbs"
          type="number"
          step="0.1"
          min={0}
          defaultValue={0}
          required
        />
      </FormField>

      <FormField label="Fat (g)" htmlFor="fat">
        <Input
          id="fat"
          name="fat"
          type="number"
          step="0.1"
          min={0}
          defaultValue={0}
          required
        />
      </FormField>

      <div className="md:col-span-2 flex flex-col gap-3">
        {state.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
        <div className="flex justify-end">
          <AuthSubmitButton label="Add meal" pendingLabel="Saving…" />
        </div>
      </div>
    </form>
  );
}
