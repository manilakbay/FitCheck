import { KeyRound, ShieldAlert, Sparkles, TerminalSquare } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ApiKeyForm } from "@/features/settings/api-key-form";
import { DeleteKeyForm } from "@/features/settings/danger-zone";
import { PreferencesForm } from "@/features/settings/preferences-form";
import { TestConnectionForm } from "@/features/settings/test-connection";
import { requireUser } from "@/lib/supabase/auth";
import { AI_LIMITS } from "@/services/ai/settings";
import { getUserAiSettingsPublic } from "@/services/ai/settings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getUserAiSettingsPublic(user.id);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Bring your own OpenAI key to unlock AI-powered meal & activity logging."
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <CardTitle>AI provider</CardTitle>
              <CardDescription>
                Your key is encrypted with AES-256-GCM before it hits the database.
                Only the last 4 characters are ever shown again.
              </CardDescription>
            </div>
          </div>
          <StatusPill hasKey={settings.hasKey} enabled={settings.enabled} />
        </CardHeader>
        <CardContent>
          <ApiKeyForm settings={settings} />
        </CardContent>
      </Card>

      {settings.hasKey ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <TerminalSquare className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <CardTitle>Test connection</CardTitle>
                <CardDescription>
                  Verify the stored key still works against OpenAI.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <TestConnectionForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <KeyRound className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Model choice and on/off switch.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <PreferencesForm settings={settings} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Usage &amp; limits</CardTitle>
          <CardDescription>Rate limits are enforced server-side.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm text-slate-700 sm:grid-cols-3">
          <LimitStat
            label="Requests this month"
            value={`${settings.monthlyRequestCount} / ${AI_LIMITS.monthlyRequestLimit}`}
          />
          <LimitStat
            label="Daily cap"
            value={`${AI_LIMITS.dailyRequestLimit} requests / user`}
          />
          <LimitStat
            label="Burst cap"
            value={`${AI_LIMITS.perMinuteLimit} requests / minute`}
          />
        </CardContent>
      </Card>

      {settings.hasKey ? (
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700">
              <ShieldAlert className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-red-700">Remove API key</CardTitle>
              <CardDescription>
                Wipes the encrypted value from our database. Can&apos;t be undone.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DeleteKeyForm />
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function StatusPill({ hasKey, enabled }: { hasKey: boolean; enabled: boolean }) {
  if (!hasKey) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        Not configured
      </span>
    );
  }
  if (!enabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
        Disabled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
    </span>
  );
}

function LimitStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
