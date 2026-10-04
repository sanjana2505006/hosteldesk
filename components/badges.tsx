import { Priority, TicketStatus } from "@prisma/client";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/labels";
import { slaLabel, type SlaMark } from "@/lib/sla";
import { cn } from "@/lib/utils";

const statusClass: Record<TicketStatus, string> = {
  OPEN: "bg-black/5 text-ink",
  ASSIGNED: "bg-[#e8f2fc] text-forest",
  IN_PROGRESS: "bg-[#fff4e5] text-[#c93400]",
  WAITING_PARTS: "bg-[#fff4e5] text-[#c93400]",
  RESOLVED: "bg-[#e8f8ee] text-[#248a3d]",
  CLOSED: "bg-black/[0.04] text-ink/45",
  REJECTED: "bg-[#ffe8e6] text-rust",
};

const slaClass = {
  breach: "bg-[#ffe8e6] text-rust",
  risk: "bg-[#fff4e5] text-[#c93400]",
  ok: "bg-[#e8f8ee] text-[#248a3d]",
  done: "bg-black/[0.04] text-ink/45",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={cn("stamp", statusClass[status])}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone =
    priority === "URGENT" || priority === "HIGH"
      ? "bg-[#ffe8e6] text-rust"
      : priority === "MEDIUM"
        ? "bg-[#fff4e5] text-[#c93400]"
        : "bg-black/5 text-ink/70";
  return <span className={cn("stamp", tone)}>{PRIORITY_LABEL[priority]}</span>;
}

export function SlaBadge({
  createdAt,
  priority,
  status,
  events,
}: {
  createdAt: Date;
  priority: Priority;
  status: TicketStatus;
  events?: SlaMark[];
}) {
  const sla = slaLabel(createdAt, priority, status, events);
  return (
    <span className="flex flex-wrap items-center gap-1">
      <span className={cn("stamp", slaClass[sla.tone])}>{sla.text}</span>
      {sla.paused ? <span className={cn("stamp", slaClass.risk)}>paused</span> : null}
    </span>
  );
}
