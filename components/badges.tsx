import { Priority, TicketStatus } from "@prisma/client";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/labels";
import { slaLabel, type SlaMark } from "@/lib/sla";
import { cn } from "@/lib/utils";

const statusClass: Record<TicketStatus, string> = {
  OPEN: "bg-ink/10 text-ink",
  ASSIGNED: "bg-[#e8f2fc] text-forest dark:bg-[#2a3542] dark:text-[#a9c4e0]",
  IN_PROGRESS: "bg-[#fff4e5] text-[#c93400] dark:bg-[#3a3428] dark:text-[#d4c09a]",
  WAITING_PARTS: "bg-[#fff4e5] text-[#c93400] dark:bg-[#3a3428] dark:text-[#d4c09a]",
  RESOLVED: "bg-[#e8f8ee] text-[#248a3d] dark:bg-[#2a3830] dark:text-[#a8c7b0]",
  CLOSED: "bg-ink/10 text-ink/45",
  REJECTED: "bg-[#ffe8e6] text-rust dark:bg-[#3f2e2e] dark:text-[#d7a8a3]",
};

const slaClass = {
  breach: "bg-[#ffe8e6] text-rust dark:bg-[#3f2e2e] dark:text-[#d7a8a3]",
  risk: "bg-[#fff4e5] text-[#c93400] dark:bg-[#3a3428] dark:text-[#d4c09a]",
  ok: "bg-[#e8f8ee] text-[#248a3d] dark:bg-[#2a3830] dark:text-[#a8c7b0]",
  done: "bg-ink/10 text-ink/45",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={cn("stamp", statusClass[status])}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone =
    priority === "URGENT" || priority === "HIGH"
      ? "bg-[#ffe8e6] text-rust dark:bg-[#3f2e2e] dark:text-[#d7a8a3]"
      : priority === "MEDIUM"
        ? "bg-[#fff4e5] text-[#c93400] dark:bg-[#3a3428] dark:text-[#d4c09a]"
        : "bg-ink/10 text-ink/70";
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
