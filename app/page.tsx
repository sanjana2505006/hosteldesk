import Link from "next/link";
import { PublicTicketTable } from "@/components/public-ticket-table";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { isSlaBreached } from "@/lib/sla";

export const dynamic = "force-dynamic";

const demos = [
  ["Student", "student@hosteldesk.dev", "student123"],
  ["Warden", "warden@hosteldesk.dev", "warden123"],
  ["Worker", "worker@hosteldesk.dev", "worker123"],
  ["Admin", "admin@hosteldesk.dev", "admin123"],
];

const done = ["RESOLVED", "CLOSED", "REJECTED"];

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

  const open = tickets.filter((ticket) => !done.includes(ticket.status)).length;
  const late = tickets.filter((ticket) =>
    isSlaBreached(ticket.createdAt, ticket.priority, ticket.status, ticket.events),
  ).length;
  const closed = tickets.filter((ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED").length;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Hostel complaint desk</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">
              Students file a room complaint. Wardens assign a worker. The list below is what is on the desk right now.
              Sign in to open a ticket.
            </p>
          </div>
          <Link href="/login" className="rounded-md bg-forest px-4 py-2 text-sm text-white">
            Login
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-ink/55">Open</p>
            <p className="mt-1 text-2xl font-semibold">{open}</p>
          </div>
          <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-ink/55">Late</p>
            <p className="mt-1 text-2xl font-semibold text-rust">{late}</p>
          </div>
          <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-ink/55">Resolved or closed</p>
            <p className="mt-1 text-2xl font-semibold">{closed}</p>
          </div>
        </div>

        <div className="mt-8 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">Latest complaints</h2>
          <Link href="/complaints" className="text-sm text-forest underline">
            All complaints
          </Link>
        </div>
        <div className="mt-3">
          <PublicTicketTable tickets={tickets.slice(0, 5)} />
        </div>

        <h2 className="mt-10 text-base font-semibold text-ink">Demo accounts</h2>
        <p className="mt-1 text-sm text-ink/60">
          Pick one and sign in. Each role only sees its own queue.{" "}
          <Link href="/how-it-works" className="text-forest underline">
            How a ticket moves
          </Link>
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-ink/55">
              <tr>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Password</th>
              </tr>
            </thead>
            <tbody>
              {demos.map(([role, email, password]) => (
                <tr key={email} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{role}</td>
                  <td className="px-3 py-2">{email}</td>
                  <td className="px-3 py-2">{password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
