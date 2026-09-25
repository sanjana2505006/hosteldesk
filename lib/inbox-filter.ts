import { Category, Priority, TicketStatus } from "@prisma/client";
import { isSlaBreached } from "@/lib/sla";

type Row = {
  ref: string;
  title: string;
  roomNumber: string;
  status: TicketStatus;
  category: Category;
  priority: Priority;
  createdAt: Date;
  reporter: { name: string };
};

export function filterInbox<T extends Row>(
  tickets: T[],
  query: { q: string; status?: TicketStatus; category?: Category; lateOnly: boolean },
) {
  const needle = query.q.toLowerCase();
  return tickets.filter((ticket) => {
    if (query.status && ticket.status !== query.status) return false;
    if (query.category && ticket.category !== query.category) return false;
    if (query.lateOnly && !isSlaBreached(ticket.createdAt, ticket.priority, ticket.status)) return false;
    if (!needle) return true;
    const hay = `${ticket.ref} ${ticket.title} ${ticket.roomNumber} ${ticket.reporter.name}`.toLowerCase();
    return hay.includes(needle);
  });
}
