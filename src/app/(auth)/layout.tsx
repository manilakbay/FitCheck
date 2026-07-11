import Link from "next/link";
import { Flame } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-brand-50/40">
      <header className="px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Flame className="h-4 w-4" aria-hidden />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">FitTrack AI</div>
            <div className="text-xs text-slate-500">Personal fitness tracker</div>
          </div>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-4 md:pt-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
