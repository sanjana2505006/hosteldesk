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
    <>
    <ul className="space-y-3 md:hidden">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="rounded-2xl bg-white px-4 py-4">
          <p className="text-sm text-forest">{ticket.ref}</p>
          <p className="mt-1 font-medium tracking-tight text-ink">{ticket.title}</p>
          <p className="mt-1 text-base text-[#6e6e73]">
            {CATEGORY_LABEL[ticket.category]} · {ticket.hostel.block} {ticket.roomNumber}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <SlaBadge
              createdAt={ticket.createdAt}
              priority={ticket.priority}
              status={ticket.status}
              events={ticket.events}
            />
          </div>
        </li>
      ))}
    </ul>
    <div className="hidden overflow-x-auto rounded-2xl bg-white md:block">
      <table className="w-full text-left text-base">
        <thead className="border-b border-black/5 text-sm font-normal text-[#6e6e73]">
          <tr>
            <th className="px-5 py-3 font-normal">Ref</th>
            <th className="px-5 py-3 font-normal">Complaint</th>
            <th className="px-5 py-3 font-normal">Status</th>
            <th className="px-5 py-3 font-normal">Priority</th>
            <th className="px-5 py-3 font-normal">SLA</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-black/5 last:border-0">
              <td className="px-5 py-4 text-forest">{ticket.ref}</td>
              <td className="px-5 py-4">
                <p className="font-medium tracking-tight text-ink">{ticket.title}</p>
                <p className="mt-0.5 text-base text-[#6e6e73]">
                  {CATEGORY_LABEL[ticket.category]} · {ticket.hostel.block} {ticket.roomNumber}
                </p>
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-5 py-4">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-5 py-4">
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
    </>
  );
}
