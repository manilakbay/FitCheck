import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FormAlertProps {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

const TONES: Record<FormAlertProps["tone"], string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
};

export function FormAlert({ tone, children, className }: FormAlertProps) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        TONES[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
      <div className="flex-1">{children}</div>
    </div>
  );
}
