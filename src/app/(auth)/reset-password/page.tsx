import Link from "next/link";

import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter the email address associated with your account and we&apos;ll send a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered it?{" "}
          <Link className="font-medium text-brand-600 hover:underline" href="/sign-in">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
