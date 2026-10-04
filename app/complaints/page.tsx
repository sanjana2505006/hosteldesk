import Link from "next/link";
import { PublicTicketTable } from "@/components/public-ticket-table";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage() {
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
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-ink">Complaints</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">
          Every ticket on the desk, newest first. Room and status are public here. The description, photos, and
          comments stay behind login.{" "}
          <Link href="/login" className="text-forest underline">
            Sign in
          </Link>{" "}
          to open one.
        </p>
        <div className="mt-6">
          <PublicTicketTable tickets={tickets} />
        </div>
      </main>
    </div>
  );
}
