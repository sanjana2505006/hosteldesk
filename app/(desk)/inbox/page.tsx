import Link from "next/link";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/stat-card";
import { TicketRow } from "@/components/ticket-row";
import { ticketWhereFor } from "@/lib/access";
import { filterInbox } from "@/lib/inbox-filter";
import { CATEGORY_LABEL, CATEGORIES, STATUS_LABEL, STATUSES } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { ticketListInclude } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { isSlaBreached } from "@/lib/sla";

export const dynamic = "force-dynamic";

type Search = {
  q?: string | string[];
  status?: string | string[];
  category?: string | string[];
  late?: string | string[];
};

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function InboxPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const where = ticketWhereFor(user);
  const tickets = await prisma.ticket.findMany({
    where,
    include: ticketListInclude,
    orderBy: { createdAt: "desc" },
  });

  const q = one(searchParams.q);
  const status = STATUSES.find((item) => item === one(searchParams.status));
  const category = CATEGORIES.find((item) => item === one(searchParams.category));
  const lateOnly = one(searchParams.late) === "1";
  const shown = filterInbox(tickets, { q, status, category, lateOnly });

  const filtering = Boolean(q || status || category || lateOnly);

  const open = tickets.filter((t) => !["RESOLVED", "CLOSED", "REJECTED"].includes(t.status)).length;
  const breached = tickets.filter((t) => isSlaBreached(t.createdAt, t.priority, t.status, t.events)).length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "WAITING_PARTS").length;
  const resolved = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  const heading =
    user.role === "WORKER" ? "My jobs" : user.role === "STUDENT" ? "My complaints" : "Hostel inbox";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{heading}</h1>
          <p className="mt-1 text-base text-ink/55">
            {user.role === "WARDEN" || user.role === "ADMIN"
              ? "Assign a worker. Anything red is already late."
              : user.role === "WORKER"
                ? "These are the jobs assigned to you."
                : "These are the complaints for your room."}
          </p>
        </div>
        {user.role !== "WORKER" ? (
          <Link
            href="/tickets/new"
            className="inline-flex w-full items-center justify-center rounded-full bg-forest px-5 py-3 text-base text-white sm:w-auto"
          >
            {user.role === "STUDENT" ? "File a complaint" : "New ticket"}
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Open" value={open} />
        <StatCard label="Late" value={breached} alert={breached > 0} hint="Unresolved past deadline" />
        <StatCard label="In progress" value={inProgress} />
        <StatCard label="Done" value={resolved} />
      </div>

      <form method="get" className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-end">
        <label className="text-sm sm:w-48">
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Room, ref, or title"
            className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2.5 text-base"
          />
        </label>
        <label className="text-sm">
          Status
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2.5 text-base sm:w-auto"
          >
            <option value="">Any</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Category
          <select
            name="category"
            defaultValue={category ?? ""}
            className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2.5 text-base sm:w-auto"
          >
            <option value="">Any</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="late" value="1" defaultChecked={lateOnly} />
          Late only
        </label>
        <button className="rounded-full bg-forest px-4 py-2.5 text-base text-white">Filter</button>
        {filtering ? (
          <Link href="/inbox" className="mb-2 text-sm text-ink/55">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="overflow-hidden rounded-lg border border-line bg-panel shadow-desk">
        <div className="hidden border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40 md:grid md:grid-cols-[88px_1fr_140px_120px_140px]">
          <span>Ref</span>
          <span>Complaint</span>
          <span>Status</span>
          <span>Priority</span>
          <span>SLA</span>
        </div>
        {filtering ? (
          <p className="border-b border-line px-4 py-2 text-xs text-ink/45">
            Showing {shown.length} of {tickets.length}
          </p>
        ) : null}
        {shown.length ? (
          shown.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
        ) : (
          <p className="px-4 py-10 text-sm text-ink/50">
            {filtering ? "Nothing matches this filter." : "Nothing in this queue yet."}
          </p>
        )}
      </section>
    </div>
  );
}
