import { Flame } from "lucide-react";

import { SignOutButton } from "@/features/auth/sign-out-button";

export interface TopBarProps {
  userEmail?: string | null;
  fullName?: string | null;
}

export function TopBar({ userEmail, fullName }: TopBarProps) {
  const displayName = fullName?.trim() || userEmail?.split("@")[0] || "there";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Flame className="h-4 w-4" aria-hidden />
        </span>
        <span className="text-sm font-semibold text-slate-900">FitTrack</span>
      </div>
      <div className="hidden flex-col leading-tight lg:flex">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Welcome back
        </span>
        <span className="text-sm font-semibold text-slate-900">{displayName}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-slate-500 sm:inline">{userEmail}</span>
        <SignOutButton />
      </div>
    </header>
  );
}
