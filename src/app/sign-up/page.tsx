import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpFooter, SignUpForm } from "@/components/auth/SignUpForm";
import { authCopy } from "@/lib/uk-copy";

export const metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title={authCopy.signUpTitle}
      subtitle={authCopy.signUpSubtitle}
      footer={<SignUpFooter />}
    >
      <SignUpForm />
    </AuthShell>
  );
}
