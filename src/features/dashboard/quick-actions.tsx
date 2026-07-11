import Link from "next/link";
import { Dumbbell, Utensils } from "lucide-react";

export function QuickActions() {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ActionTile
        href="/nutrition/new"
        icon={<Utensils className="h-5 w-5" aria-hidden />}
        title="Log a meal"
        subtitle="Track calories & macros"
        tone="brand"
      />
      <ActionTile
        href="/activity/new"
        icon={<Dumbbell className="h-5 w-5" aria-hidden />}
        title="Log a workout"
        subtitle="MET-based calorie burn"
        tone="accent"
      />
    </section>
  );
}

function ActionTile({
  href,
  icon,
  title,
  subtitle,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "brand" | "accent";
}) {
  const toneClasses =
    tone === "brand"
      ? "bg-gradient-to-br from-brand-500 to-brand-700 hover:from-brand-500 hover:to-brand-800"
      : "bg-gradient-to-br from-accent-500 to-accent-600 hover:from-accent-500 hover:to-accent-600";
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left text-white shadow-sm transition-shadow hover:shadow-md ${toneClasses}`}
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-transform group-hover:scale-105">
          {icon}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-white/80">{subtitle}</span>
        </span>
      </span>
      <span
        aria-hidden
        className="text-lg font-semibold text-white/70 transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
