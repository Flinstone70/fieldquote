import { AuthShell } from "@/components/auth/AuthShell";
import { OtpForm } from "@/components/auth/OtpForm";
import { authCopy } from "@/lib/uk-copy";

export const metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthShell
      title={authCopy.verifyEmailTitle}
      subtitle={authCopy.verifyEmailSubtitle}
    >
      <OtpForm action="verify-email" email={email} />
    </AuthShell>
  );
}
