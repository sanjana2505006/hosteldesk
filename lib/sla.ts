import { Priority, TicketStatus } from "@prisma/client";

/** Hours a ticket may stay unresolved before it is considered breached. */
export const SLA_HOURS: Record<Priority, number> = {
  URGENT: 8,
  HIGH: 24,
  MEDIUM: 48,
  LOW: 72,
};

const TERMINAL: TicketStatus[] = ["RESOLVED", "CLOSED", "REJECTED"];
const WAITING_MARK = "Status → Waiting on parts";

export type SlaMark = {
  type: string;
  message: string;
  createdAt: Date;
};

// Time spent on "waiting on parts" is not counted. Read it off the timeline
// (the same status lines the route already writes) so there is no second clock.
export function pausedMs(events: SlaMark[] | undefined, status: TicketStatus, now = new Date()) {
  if (!events?.length) return 0;
  const ordered = [...events].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  let paused = 0;
  let started: number | null = null;

  for (const event of ordered) {
    if (event.type !== "STATUS_CHANGED") continue;
    const waiting = event.message.startsWith(WAITING_MARK);
    if (waiting) {
      started = event.createdAt.getTime();
      continue;
    }
    if (started != null && event.message.startsWith("Status →")) {
      paused += event.createdAt.getTime() - started;
      started = null;
    }
  }

  if (started != null && status === "WAITING_PARTS") {
    paused += now.getTime() - started;
  }

  return Math.max(0, paused);
}

export function slaDeadline(createdAt: Date, priority: Priority, events: SlaMark[] = [], status?: TicketStatus, now = new Date()) {
  const pause = status ? pausedMs(events, status, now) : 0;
  return new Date(createdAt.getTime() + SLA_HOURS[priority] * 60 * 60 * 1000 + pause);
}

export function hoursLeft(
  createdAt: Date,
  priority: Priority,
  events: SlaMark[] = [],
  status?: TicketStatus,
  now = new Date(),
) {
  return (slaDeadline(createdAt, priority, events, status, now).getTime() - now.getTime()) / (60 * 60 * 1000);
}

export function isSlaBreached(
  createdAt: Date,
  priority: Priority,
  status: TicketStatus,
  events: SlaMark[] = [],
  now = new Date(),
) {
  if (TERMINAL.includes(status)) return false;
  return now > slaDeadline(createdAt, priority, events, status, now);
}

export function slaLabel(
  createdAt: Date,
  priority: Priority,
  status: TicketStatus,
  events: SlaMark[] = [],
  now = new Date(),
) {
  const paused = status === "WAITING_PARTS" && pausedMs(events, status, now) > 0;
  if (TERMINAL.includes(status)) return { tone: "done" as const, text: "Met / closed", paused: false };
  const left = hoursLeft(createdAt, priority, events, status, now);
  if (left < 0) {
    const overdue = Math.abs(left);
    const text =
      overdue >= 24
        ? `${Math.floor(overdue / 24)}d overdue`
        : `${Math.max(1, Math.round(overdue))}h overdue`;
    return { tone: "breach" as const, text, paused };
  }
  if (left <= 6) {
    return { tone: "risk" as const, text: `${Math.max(1, Math.round(left))}h left`, paused };
  }
  const text =
    left >= 24 ? `${Math.floor(left / 24)}d ${Math.round(left % 24)}h left` : `${Math.round(left)}h left`;
  return { tone: "ok" as const, text, paused };
}
