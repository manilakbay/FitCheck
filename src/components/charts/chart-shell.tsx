import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ChartShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  headline?: React.ReactNode;
  emptyMessage?: string | null;
}

export function ChartShell({
  title,
  description,
  action,
  headline,
  emptyMessage,
  children,
}: ChartShellProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
          {headline ? (
            <div className="mt-2 text-2xl font-semibold text-slate-900">{headline}</div>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        <div className="relative h-56 w-full">
          {children}
          {emptyMessage ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 px-6 text-center text-xs text-slate-500 backdrop-blur-[1px]">
              {emptyMessage}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
