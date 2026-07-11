import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, BarChart3, Flame, Salad, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/supabase/auth";

export default async function LandingPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-16 md:py-24">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Flame className="h-5 w-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <div className="text-base font-semibold text-slate-900">FitTrack AI</div>
              <div className="text-xs text-slate-500">Nutrition & activity tracker</div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/sign-in" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </header>

        <section className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Modern personal wellness
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Track meals, workouts, and progress in one clean dashboard.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              FitTrack AI computes your BMR, TDEE, and daily targets automatically, then lets
              you log food and activity in seconds. Beautiful charts, mobile-first design,
              and an AI-ready core for natural-language logging.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up">
                <Button size="lg">Create free account</Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="secondary">
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
            <FeatureCard
              icon={Salad}
              title="Nutrition"
              body="Log meals with per-macro totals and see daily calorie / protein progress."
            />
            <FeatureCard
              icon={Activity}
              title="Activity"
              body="Estimate calories burned via MET-based math for six activity types."
            />
            <FeatureCard
              icon={BarChart3}
              title="Charts"
              body="Weight, calorie intake, calories burned, and protein trends via Recharts."
            />
            <FeatureCard
              icon={Sparkles}
              title="AI-ready"
              body="Interfaces prepared for natural-language meal and activity parsing."
            />
          </div>
        </section>

        <footer className="mt-20 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. Open-source starter
            for personal fitness apps.
          </p>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Flame;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
