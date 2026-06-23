import Link from "next/link";
import { OwnerQuoteView } from "@/components/quotes/OwnerQuoteView";
import { assertActiveSubscription, requireQuoteOwner } from "@/lib/auth/guards";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; emailed?: string }>;
};

export default async function DashboardQuotePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { created, emailed } = await searchParams;
  const { user, quote } = await requireQuoteOwner(id);
  assertActiveSubscription(user);

  return (
    <OwnerQuoteView
      quote={quote}
      justCreated={created === "1"}
      emailSent={emailed === "1"}
    />
  );
}
