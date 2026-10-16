import Link from "next/link";
import { PublicTicketTable } from "@/components/public-ticket-table";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tickets = await prisma.ticket.findMany({
    select: {
      id: true,
      ref: true,
      title: true,
      roomNumber: true,
      status: true,
      priority: true,
      category: true,
      createdAt: true,
      hostel: { select: { name: true, block: true } },
      events: {
        select: { type: true, message: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-14">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">Hostel complaint desk.</h1>
          <p className="mt-4 text-[19px] leading-snug text-ink/60">
            Look through what is on the desk. No account for that. Room and status are public. The write-up stays private.{" "}
            <Link href="/how-it-works" className="text-forest hover:underline">
              How it works
            </Link>
            .
          </p>
          <Link
            href="/tickets/new"
            className="mt-6 inline-flex rounded-full bg-forest px-5 py-2.5 text-[17px] text-white transition-colors duration-200 hover:bg-forest-600"
          >
            File a complaint
          </Link>
          <p className="mt-3 text-sm text-ink/55">Filing one is when the desk asks you to sign in.</p>
        </div>
        <h2 className="mb-3 mt-12 text-2xl font-semibold tracking-tight text-ink">On the desk</h2>
        <PublicTicketTable tickets={tickets} />
      </main>
    </div>
  );
}
