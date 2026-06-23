import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInFooter, SignInForm } from "@/components/auth/SignInForm";
import { authCopy } from "@/lib/uk-copy";

export const metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <AuthShell
      title={authCopy.signInTitle}
      subtitle={authCopy.signInSubtitle}
      footer={<SignInFooter />}
    >
      <Suspense fallback={<div className="text-sm text-neutral-400">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
