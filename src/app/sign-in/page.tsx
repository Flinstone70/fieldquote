import { Suspense } from "react";
import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInFooter, SignInForm } from "@/components/auth/SignInForm";
import { getSession } from "@/lib/auth/session";
import { authCopy } from "@/lib/uk-copy";

export const metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const session = await getSession();

  return (
    <AuthShell
      title={authCopy.signInTitle}
      subtitle={authCopy.signInSubtitle}
      footer={session ? undefined : <SignInFooter />}
    >
      {session ? (
        <AlreadySignedIn user={session} />
      ) : (
        <Suspense fallback={<div className="text-sm text-neutral-400">Loading...</div>}>
          <SignInForm />
        </Suspense>
      )}
    </AuthShell>
  );
}
