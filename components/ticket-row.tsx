import Link from "next/link";
import { Ticket, Hostel, User } from "@prisma/client";
import { CATEGORY_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { PriorityBadge, SlaBadge, StatusBadge } from "@/components/badges";

type Row = Ticket & {
  hostel: Hostel;
  reporter: Pick<User, "id" | "name" | "roomNumber">;
  assignee: Pick<User, "id" | "name"> | null;
};

export function TicketRow({ ticket }: { ticket: Row }) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="grid grid-cols-1 gap-3 border-b border-line px-4 py-4 transition hover:bg-[#fbf6ec] md:grid-cols-[88px_1fr_140px_120px_140px] md:items-center"
    >
      <p className="font-mono text-xs text-forest">{ticket.ref}</p>
      <div>
        <p className="font-medium text-ink">{ticket.title}</p>
        <p className="mt-1 text-xs text-ink/55">
          {CATEGORY_LABEL[ticket.category]} · {ticket.hostel.block} {ticket.roomNumber} ·{" "}
          {ticket.reporter.name}
        </p>
      </div>
      <StatusBadge status={ticket.status} />
      <PriorityBadge priority={ticket.priority} />
      <div className="flex flex-col items-start gap-1">
        <SlaBadge createdAt={ticket.createdAt} priority={ticket.priority} status={ticket.status} />
        <span className="text-[11px] text-ink/40">{formatDate(ticket.createdAt)}</span>
      </div>
    </Link>
  );
}
