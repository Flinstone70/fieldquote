import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpFooter, SignUpForm } from "@/components/auth/SignUpForm";
import { getSession } from "@/lib/auth/session";
import { authCopy } from "@/lib/uk-copy";

export const metadata = {
  title: "Create account",
};

export default async function SignUpPage() {
  const session = await getSession();

  return (
    <AuthShell
      title={authCopy.signUpTitle}
      subtitle={authCopy.signUpSubtitle}
      footer={session ? undefined : <SignUpFooter />}
    >
      {session ? <AlreadySignedIn user={session} /> : <SignUpForm />}
    </AuthShell>
  );
}
