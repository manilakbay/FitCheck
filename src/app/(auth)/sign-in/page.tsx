import Link from "next/link";

import { SignInForm } from "@/features/auth/sign-in-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your FitTrack AI account.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm next={params.next} />
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-brand-600 hover:underline" href="/sign-up">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
