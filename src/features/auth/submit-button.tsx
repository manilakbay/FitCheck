"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

export interface AuthSubmitButtonProps extends Omit<ButtonProps, "children"> {
  label: string;
  pendingLabel?: string;
}

export function AuthSubmitButton({
  label,
  pendingLabel,
  disabled,
  ...props
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {pendingLabel ?? "Please wait…"}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
