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
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-14">
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Complaints.</h1>
        <p className="mt-4 max-w-xl text-[19px] leading-snug text-[#6e6e73]">
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
