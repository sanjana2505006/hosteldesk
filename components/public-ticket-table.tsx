import { Category, Priority, TicketStatus } from "@prisma/client";
import { PriorityBadge, SlaBadge, StatusBadge } from "@/components/badges";
import { CATEGORY_LABEL } from "@/lib/labels";
import { SlaMark } from "@/lib/sla";

export type PublicTicket = {
  id: string;
  ref: string;
  title: string;
  roomNumber: string;
  status: TicketStatus;
  priority: Priority;
  category: Category;
  createdAt: Date;
  hostel: { name: string; block: string };
  events: SlaMark[];
};

export function PublicTicketTable({ tickets }: { tickets: PublicTicket[] }) {
  if (!tickets.length) {
    return <p className="text-sm text-ink/60">No complaints filed yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-ink/55">
          <tr>
            <th className="px-3 py-2 font-medium">Ref</th>
            <th className="px-3 py-2 font-medium">Complaint</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Priority</th>
            <th className="px-3 py-2 font-medium">SLA</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-line last:border-0">
              <td className="px-3 py-3 font-mono text-xs text-forest">{ticket.ref}</td>
              <td className="px-3 py-3">
                <p className="font-medium text-ink">{ticket.title}</p>
                <p className="mt-0.5 text-xs text-ink/55">
                  {CATEGORY_LABEL[ticket.category]} · {ticket.hostel.block} {ticket.roomNumber}
                </p>
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-3 py-3">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-3 py-3">
                <SlaBadge
                  createdAt={ticket.createdAt}
                  priority={ticket.priority}
                  status={ticket.status}
                  events={ticket.events}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
