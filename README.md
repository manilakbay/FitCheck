<div align="center">

# FitTrack AI

Personal fitness and nutrition tracker built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

</div>

FitTrack AI is a production-quality MVP that lets a signed-in user manage a
personal profile (with automatic BMR / TDEE / calorie target math), log meals
and physical activities, and visualise progress through a modern dashboard.
The codebase is set up for future AI-powered natural language logging without
committing to a specific model provider.

---

## Contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment variables](#environment-variables)
6. [Supabase setup](#supabase-setup)
7. [Running locally](#running-locally)
8. [Scripts](#scripts)
9. [Deployment to Vercel](#deployment-to-vercel)
10. [Continuous integration](#continuous-integration)
11. [Architecture notes](#architecture-notes)
12. [Roadmap](#roadmap)

---

## Features

- **Authentication** – email + password sign-up, sign-in, sign-out, password
  reset, and update-password flows powered by Supabase Auth (`@supabase/ssr`).
- **Profile** – captures full name, age, gender, height, weight, activity level,
  and goal (lose / maintain / gain / gain muscle). Automatically calculates
  BMR (Mifflin-St Jeor), TDEE, daily calorie target, and macro split.
- **Nutrition tracking** – add food entries (date, meal, name, quantity, unit,
  calories & macros), see a per-day history and a live daily-totals summary.
- **Activity tracking** – log activities (walking, running, swimming, cycling,
  weight training, other) with duration, optional distance, and intensity.
  Calories burned are estimated via a MET table × bodyweight × time.
- **Dashboard** – calories in / out / net, macro progress bars, current & goal
  weight, recent meals, recent activities, and four Recharts panels
  (calorie intake, calories burned, weight trend, protein trend).
- **Row Level Security** – every table is RLS-locked to the row owner.
- **AI-ready** – `src/services/ai/` ships with typed contracts for
  natural-language meal and activity parsing plus stub implementations that
  throw `NotImplementedError`. Wire in OpenAI (or any other provider) later.
- **Responsive & mobile-first** – sidebar on desktop, bottom nav on mobile,
  designed with modern wellness apps as reference.

## Tech stack

| Layer                | Choice                                                                        |
| -------------------- | ----------------------------------------------------------------------------- |
| Framework            | [Next.js 15](https://nextjs.org/) (App Router, RSC, Server Actions)           |
| Language             | TypeScript (strict, `noUncheckedIndexedAccess`)                               |
| Styling              | [Tailwind CSS v4](https://tailwindcss.com/)                                   |
| Auth & DB            | [Supabase](https://supabase.com/) (Postgres + Auth via `@supabase/ssr`)       |
| Validation           | [Zod](https://zod.dev/)                                                       |
| Charts               | [Recharts](https://recharts.org/)                                             |
| Icons                | [lucide-react](https://lucide.dev/)                                           |
| Class utilities      | `class-variance-authority`, `clsx`, `tailwind-merge`                          |
| Tooling              | ESLint (Next config) + Prettier + TypeScript                                  |

## Project structure

```
src/
├── app/
│   ├── (auth)/            # sign-in, sign-up, reset-password, update-password
│   ├── (app)/             # protected shell + dashboard/profile/nutrition/activity
│   ├── auth/callback/     # PKCE code exchange handler
│   ├── auth/confirm/      # Email OTP verification handler
│   ├── layout.tsx         # Root layout, fonts, metadata
│   └── page.tsx           # Landing page (redirects to /dashboard when signed in)
├── components/
│   ├── ui/                # Design-system primitives (Button, Card, Input, ...)
│   ├── layout/            # Sidebar, TopBar, MobileNav, PageHeader, NavItems
│   └── charts/            # Recharts wrappers used by the dashboard
├── features/
│   ├── auth/              # Server actions + client forms for auth flows
│   ├── profile/           # Profile form, energy summary, queries
│   ├── nutrition/         # Add-meal form, history list, daily summary, actions
│   ├── activity/          # Add-activity form (with live calorie estimate)
│   └── dashboard/         # Dashboard data loader + KPI/chart composition
├── lib/
│   ├── supabase/          # createBrowserClient / createServerClient / middleware
│   ├── env.ts             # Zod-validated public + server env
│   ├── dates.ts           # date-fns helpers
│   ├── format.ts          # kcal / g / kg formatters
│   ├── constants.ts       # UI-facing enum → label mappings
│   └── utils.ts           # cn(), clamp(), round()
├── services/
│   ├── profile/energy.ts  # BMR / TDEE / calorie target / macro math
│   ├── activity/calories.ts # MET-based calorie burn estimate
│   └── ai/                # Interfaces + stub parsers for future LLM wiring
├── types/
│   ├── models.ts          # Domain entities (Profile, FoodEntry, ...)
│   └── database.ts        # Hand-written Supabase Database type
└── middleware.ts          # Session refresh + protected-route guard
supabase/
└── migrations/            # SQL migrations for tables, triggers, RLS policies
docs/
└── SCHEMA.md              # Human-readable database schema doc
.github/
└── workflows/ci.yml       # Lint + typecheck + build workflow
```

## Prerequisites

- Node.js **≥ 20** (project developed on 22.x)
- npm (or your preferred package manager — commands assume `npm`)
- A Supabase project (free tier is fine)

## Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project
credentials:

```bash
cp .env.example .env.local
```

| Name                              | Required     | Description                                                                                                     |
| --------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Yes          | Project URL from Supabase dashboard → Settings → API                                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Yes          | Anon (public) API key                                                                                           |
| `SUPABASE_SERVICE_ROLE_KEY`       | No           | Service-role key. Only needed for admin utilities in `lib/supabase/admin.ts`. **Never expose to the browser.**  |
| `NEXT_PUBLIC_SITE_URL`            | Recommended  | Public site URL used for auth email redirect URLs (defaults to `http://localhost:3000`)                         |

At runtime the app validates these with Zod. During `npm run build` (or when
`CI=true`), it falls back to safe placeholder values so the build never fails
just because secrets aren't wired up.

## Supabase setup

1. Create a project on [supabase.com](https://supabase.com/).
2. Copy the URL and the anon key into `.env.local`.
3. Apply the migrations in [`supabase/migrations/`](./supabase/migrations/) in
   order. Two options:

   **Option A — Supabase CLI (recommended for local dev):**

   ```bash
   npm install --global supabase
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   **Option B — Supabase dashboard SQL editor:**
   Open each `.sql` file in `supabase/migrations/` (in numeric order) and run
   it against your project.

4. In Supabase → Authentication → URL Configuration:
   - Add `http://localhost:3000/auth/callback` and your production URL
     (e.g. `https://your-app.vercel.app/auth/callback`) to **Redirect URLs**.
   - Add `http://localhost:3000/auth/confirm` and the production equivalent.
5. In Supabase → Authentication → Providers, ensure "Email" is enabled.

The migrations create the following tables, each with `created_at` /
`updated_at` triggers and full row-level security policies:

- `profiles`
- `weight_records`
- `food_entries`
- `activity_entries`
- `daily_goals`

They also install a trigger on `auth.users` that seeds a matching `profiles`
row automatically at sign-up. See [`docs/SCHEMA.md`](./docs/SCHEMA.md) for
the full column-by-column breakdown.

## Running locally

```bash
npm install
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

Suggested first-run flow:

1. Sign up with your email.
2. Confirm the email via the link Supabase sends (or disable email confirmation
   in the Supabase dashboard while developing).
3. Complete your profile so BMR / TDEE / calorie target are computed.
4. Add a meal, an activity, and revisit the dashboard.

## Scripts

| Script              | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Start the Next.js dev server                         |
| `npm run build`     | Production build                                     |
| `npm run start`     | Serve the production build                           |
| `npm run lint`      | ESLint (Next.js config + Prettier compatibility)     |
| `npm run typecheck` | `tsc --noEmit`                                       |
| `npm run format`    | Prettier write across the repo                       |

## Deployment to Vercel

1. Push this repository to GitHub.
2. Create a new project on [Vercel](https://vercel.com/) and import the repo.
3. Set the environment variables (see [Environment variables](#environment-variables)):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` — your production URL, e.g. `https://your-app.vercel.app`
   - `SUPABASE_SERVICE_ROLE_KEY` — only if you rely on the admin client
4. Add the production `/auth/callback` and `/auth/confirm` URLs to Supabase →
   Auth → URL Configuration → Redirect URLs.
5. Deploy. Vercel picks up the framework preset for Next.js automatically —
   no additional config required.

## Continuous integration

The [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) workflow runs on
every push and PR against `main`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

It uses placeholder Supabase env vars so the build always succeeds without
exposing real secrets. Real deployments must set the real values in Vercel.

## Architecture notes

- **Server Components first.** Every page (`app/(app)/dashboard`, `profile`,
  `nutrition`, `activity`) is a Server Component that reads directly from
  Supabase with a session-bound cookie client. Mutations go through Server
  Actions in `features/*/actions.ts`.
- **Type-safe Supabase.** `src/types/database.ts` is a hand-written type used
  everywhere the client is instantiated. Regenerate it with
  `supabase gen types typescript --project-id <ref> > src/types/database.ts`
  once your Supabase project is set up.
- **Auth guard.** `middleware.ts` refreshes the Supabase session on every
  matching request and redirects unauthenticated users away from `/dashboard`,
  `/profile`, `/nutrition*`, and `/activity*`.
- **Energy math.** `services/profile/energy.ts` implements the Mifflin-St
  Jeor equation, activity-level multipliers, goal-based calorie adjustment,
  and goal-based macro splits. Pure, side-effect free, easy to unit test.
- **AI stubs.** `services/ai/` exposes `MealParser` and `ActivityParser`
  contracts with stub implementations that throw `NotImplementedError`.
  Search for `TODO(ai)` when you're ready to plug in an LLM.

## Roadmap

- Wire the AI stubs to OpenAI (natural language meal + activity logging).
- Add per-food macros database + autocomplete.
- Weekly / monthly aggregate views.
- Photo-based food logging.
- Export data as CSV.
- Push notifications for daily targets.

---

Built as a learning-friendly starter for personal wellness apps. Contributions
and forks welcome.
