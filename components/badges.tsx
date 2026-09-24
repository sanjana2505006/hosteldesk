import { Priority, TicketStatus } from "@prisma/client";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/labels";
import { slaLabel } from "@/lib/sla";
import { cn } from "@/lib/utils";

const statusClass: Record<TicketStatus, string> = {
  OPEN: "border-ink/20 bg-ink/5 text-ink",
  ASSIGNED: "border-forest/30 bg-forest/10 text-forest",
  IN_PROGRESS: "border-amber/40 bg-amber/10 text-amber",
  WAITING_PARTS: "border-amber/50 bg-[#fff4d6] text-[#7a5a10]",
  RESOLVED: "border-moss/40 bg-moss/10 text-moss",
  CLOSED: "border-line bg-paper text-ink/60",
  REJECTED: "border-rust/30 bg-rust/10 text-rust",
};

const slaClass = {
  breach: "border-rust text-rust bg-rust/10",
  risk: "border-amber text-amber bg-amber/10",
  ok: "border-forest/30 text-forest bg-forest/10",
  done: "border-line text-ink/50 bg-paper",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={cn("stamp", statusClass[status])}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone =
    priority === "URGENT" || priority === "HIGH"
      ? "border-rust/40 text-rust"
      : priority === "MEDIUM"
        ? "border-amber/40 text-amber"
        : "border-ink/20 text-ink/70";
  return <span className={cn("stamp", tone)}>{PRIORITY_LABEL[priority]}</span>;
}

export function SlaBadge({
  createdAt,
  priority,
  status,
}: {
  createdAt: Date;
  priority: Priority;
  status: TicketStatus;
}) {
  const sla = slaLabel(createdAt, priority, status);
  return <span className={cn("stamp", slaClass[sla.tone])}>{sla.text}</span>;
}
