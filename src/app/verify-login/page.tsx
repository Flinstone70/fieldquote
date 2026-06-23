import { AuthShell } from "@/components/auth/AuthShell";
import { OtpForm } from "@/components/auth/OtpForm";
import { authCopy } from "@/lib/uk-copy";

export const metadata = {
  title: "Sign-in code",
};

export default async function VerifyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; dev?: string }>;
}) {
  const { email, dev } = await searchParams;

  return (
    <AuthShell
      title={authCopy.verifyLoginTitle}
      subtitle={authCopy.verifyLoginSubtitle}
    >
      <OtpForm action="verify-login" email={email} devCode={dev} />
    </AuthShell>
  );
}
