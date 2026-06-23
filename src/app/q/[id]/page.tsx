import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { ClientQuoteView } from "@/components/ClientQuoteView";
import { getSession } from "@/lib/auth/session";
import { getQuote, getQuoteForUser, updateQuoteStatus } from "@/lib/quotes-store";
import { ui } from "@/lib/ui";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; preview?: string }>;
};

export default async function QuotePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { paid, preview } = await searchParams;

  const session = await getSession();
  if (session && preview !== "1") {
    const owned = await getQuoteForUser(id, session.userId);
    if (owned) {
      redirect(`/dashboard/quotes/${id}`);
    }
  }

  let quote = await getQuote(id);
  if (!quote) notFound();

  if (paid === "1" && quote.status !== "deposit_paid") {
    quote =
      (await updateQuoteStatus(id, "deposit_paid", {
        depositPaidAt: new Date().toISOString(),
        acceptedAt: quote.acceptedAt ?? new Date().toISOString(),
      })) ?? quote;
  }

  return (
    <>
      <Header />
      <main className={`${ui.page} py-10 sm:py-14`}>
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <ClientQuoteView quote={quote} paid={paid === "1"} />
        </div>
      </main>
    </>
  );
}
