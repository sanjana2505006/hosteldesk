import Link from "next/link";
import { redirect } from "next/navigation";
import { TicketStatus } from "@prisma/client";
import { PriorityBadge, SlaBadge } from "@/components/badges";
import { ticketWhereFor } from "@/lib/access";
import { STATUS_LABEL } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { ticketListInclude } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { isSlaBreached } from "@/lib/sla";

export const dynamic = "force-dynamic";

const COLUMNS: TicketStatus[] = ["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_PARTS", "RESOLVED"];

export default async function BoardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (user.role !== "WARDEN" && user.role !== "ADMIN") redirect("/inbox");

  const tickets = await prisma.ticket.findMany({
    where: {
      ...ticketWhereFor(user),
      status: { notIn: ["CLOSED", "REJECTED"] },
    },
    include: ticketListInclude,
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-ink">Warden board</h1>
        <p className="mt-1 text-sm text-ink/55">Columns follow the status machine. Red SLA chips are already late.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-5">
        {COLUMNS.map((status) => {
          const column = tickets.filter((t) => t.status === status);
          return (
            <section key={status} className="rounded-lg border border-line bg-panel/80 p-3">
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="text-xs uppercase tracking-[0.14em] text-ink/50">{STATUS_LABEL[status]}</h2>
                <span className="font-mono text-xs text-ink/40">{column.length}</span>
              </header>
              <div className="space-y-2">
                {column.map((ticket) => {
                  const late = isSlaBreached(ticket.createdAt, ticket.priority, ticket.status);
                  return (
                    <Link
                      key={ticket.id}
                      href={`/tickets/${ticket.id}`}
                      className={`block rounded-md border bg-white p-3 ${late ? "border-rust/50" : "border-line"}`}
                    >
                      <p className="font-mono text-[10px] text-forest">{ticket.ref}</p>
                      <p className="mt-1 text-sm font-medium leading-snug">{ticket.title}</p>
                      <p className="mt-1 text-[11px] text-ink/45">
                        {ticket.roomNumber}
                        {ticket.assignee ? ` · ${ticket.assignee.name}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <PriorityBadge priority={ticket.priority} />
                        <SlaBadge createdAt={ticket.createdAt} priority={ticket.priority} status={ticket.status} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
