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
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">Hostel complaint desk.</h1>
          <p className="mt-4 max-w-xl text-[19px] leading-snug text-[#6e6e73]">
            Students file a room complaint. Wardens assign a worker. The list below is what is on the desk right now.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-forest px-5 py-2.5 text-center text-[17px] text-white transition-colors duration-200 hover:bg-forest-600"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2.5 text-center text-[17px] text-ink transition-colors duration-200 hover:bg-black/[0.03]"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-3">
          <div className="bg-white px-6 py-5">
            <p className="text-base text-[#6e6e73]">Open</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">{open}</p>
          </div>
          <div className="bg-white px-6 py-5">
            <p className="text-base text-[#6e6e73]">Late</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-rust">{late}</p>
          </div>
          <div className="bg-white px-6 py-5">
            <p className="text-base text-[#6e6e73]">Resolved or closed</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">{closed}</p>
          </div>
        </div>

        <div className="mt-14 flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Latest complaints</h2>
          <Link href="/complaints" className="text-[17px] text-forest transition-colors duration-200 hover:underline">
            See all
          </Link>
        </div>
        <div className="mt-3">
          <PublicTicketTable tickets={tickets.slice(0, 5)} />
        </div>

        <h2 className="mt-14 text-2xl font-semibold tracking-tight text-ink">Demo accounts</h2>
        <p className="mt-2 text-[17px] text-[#6e6e73]">
          Pick one and sign in. Each role only sees its own queue.{" "}
          <Link href="/how-it-works" className="text-forest hover:underline">
            How a ticket moves
          </Link>
        </p>
        <ul className="mt-4 space-y-3 sm:hidden">
          {demos.map(([role, email, password]) => (
            <li key={email} className="rounded-2xl bg-white px-4 py-3">
              <p className="font-medium">{role}</p>
              <p className="mt-1 text-base text-[#6e6e73]">{email}</p>
              <p className="text-base text-[#6e6e73]">{password}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 hidden overflow-x-auto rounded-2xl bg-white sm:block">
          <table className="w-full text-left text-base">
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
