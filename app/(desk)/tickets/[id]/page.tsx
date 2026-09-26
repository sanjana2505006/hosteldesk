import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClearTicketAlerts } from "@/components/alert-actions";
import { CommentForm } from "@/components/comment-form";
import { PriorityBadge, SlaBadge, StatusBadge } from "@/components/badges";
import { TicketActions } from "@/components/ticket-actions";
import { canAssign, canViewTicket, ticketWhereFor } from "@/lib/access";
import { CATEGORY_LABEL, ROLE_LABEL } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { SLA_HOURS } from "@/lib/sla";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      hostel: true,
      reporter: { select: { id: true, name: true, email: true, roomNumber: true } },
      assignee: { select: { id: true, name: true, email: true } },
      events: {
        include: { actor: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket || !canViewTicket(user, ticket)) notFound();

  const sameRoom = await prisma.ticket.findMany({
    where: {
      AND: [
        ticketWhereFor(user),
        {
          hostelId: ticket.hostelId,
          roomNumber: ticket.roomNumber,
          id: { not: ticket.id },
        },
      ],
    },
    select: { id: true, ref: true, title: true, status: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const workers = canAssign(user.role)
    ? await prisma.user.findMany({
        where: {
          role: "WORKER",
          ...(user.role === "WARDEN" && user.hostelId ? { hostelId: user.hostelId } : {}),
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <ClearTicketAlerts ticketId={ticket.id} />
      <article className="space-y-6">
        <div>
          <p className="font-mono text-xs text-forest">{ticket.ref}</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">{ticket.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <SlaBadge createdAt={ticket.createdAt} priority={ticket.priority} status={ticket.status} />
          </div>
        </div>
        <p className="whitespace-pre-wrap text-ink/80">{ticket.description}</p>
        {ticket.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ticket.photoUrl} alt="Ticket photo" className="max-h-80 rounded-lg border border-line object-cover" />
        ) : null}
        <dl className="grid gap-3 rounded-lg border border-line bg-panel p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink/40">Category</dt>
            <dd>{CATEGORY_LABEL[ticket.category]}</dd>
          </div>
          <div>
            <dt className="text-ink/40">Room</dt>
            <dd>
              {ticket.hostel.block} {ticket.roomNumber}
            </dd>
          </div>
          <div>
            <dt className="text-ink/40">Reporter</dt>
            <dd>{ticket.reporter.name}</dd>
          </div>
          <div>
            <dt className="text-ink/40">Assignee</dt>
            <dd>{ticket.assignee?.name ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-ink/40">Filed</dt>
            <dd>{formatDate(ticket.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-ink/40">SLA window</dt>
            <dd>{SLA_HOURS[ticket.priority]} hours for {ticket.priority.toLowerCase()} priority</dd>
          </div>
          {ticket.rating ? (
            <div className="sm:col-span-2">
              <dt className="text-ink/40">Fix rating</dt>
              <dd>
                {ticket.rating}/5{ticket.ratingNote ? ` — ${ticket.ratingNote}` : ""}
              </dd>
            </div>
          ) : null}
        </dl>
        <section className="rounded-lg border border-line bg-panel p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">
            Also filed for {ticket.roomNumber}
          </p>
          {sameRoom.length ? (
            <ul className="mt-3 divide-y divide-line">
              {sameRoom.map((other) => (
                <li key={other.id}>
                  <Link href={`/tickets/${other.id}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="text-sm">
                      <span className="font-mono text-xs text-forest">{other.ref}</span>
                      <span className="ml-2 text-ink">{other.title}</span>
                    </span>
                    <StatusBadge status={other.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink/50">Nothing else on file for this room.</p>
          )}
        </section>
      </article>

      <aside className="space-y-6">
        <TicketActions
          ticketId={ticket.id}
          status={ticket.status}
          role={user.role}
          isAssignee={ticket.assigneeId === user.id}
          isReporter={ticket.reporterId === user.id}
          canAssignRole={canAssign(user.role)}
          workers={workers}
          assigneeId={ticket.assigneeId}
        />
        <section className="rounded-lg border border-line bg-panel p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Timeline</p>
          <ol className="mt-4 space-y-4">
            {ticket.events.map((event) => (
              <li key={event.id} className="border-l-2 border-line pl-3">
                <p className="text-sm text-ink">{event.message}</p>
                <p className="mt-1 text-[11px] text-ink/40">
                  {event.actor.name} · {ROLE_LABEL[event.actor.role]} · {formatDate(event.createdAt)}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-5">
            <CommentForm ticketId={ticket.id} />
          </div>
        </section>
      </aside>
    </div>
  );
}
