import { Priority, TicketStatus } from "@prisma/client";

/** Hours a ticket may stay unresolved before it is considered breached. */
export const SLA_HOURS: Record<Priority, number> = {
  URGENT: 8,
  HIGH: 24,
  MEDIUM: 48,
  LOW: 72,
};

const TERMINAL: TicketStatus[] = ["RESOLVED", "CLOSED", "REJECTED"];

export function slaDeadline(createdAt: Date, priority: Priority) {
  return new Date(createdAt.getTime() + SLA_HOURS[priority] * 60 * 60 * 1000);
}

export function hoursLeft(createdAt: Date, priority: Priority, now = new Date()) {
  return (slaDeadline(createdAt, priority).getTime() - now.getTime()) / (60 * 60 * 1000);
}

export function isSlaBreached(
  createdAt: Date,
  priority: Priority,
  status: TicketStatus,
  now = new Date(),
) {
  if (TERMINAL.includes(status)) return false;
  return now > slaDeadline(createdAt, priority);
}

export function slaLabel(
  createdAt: Date,
  priority: Priority,
  status: TicketStatus,
  now = new Date(),
) {
  if (TERMINAL.includes(status)) return { tone: "done" as const, text: "Met / closed" };
  const left = hoursLeft(createdAt, priority, now);
  if (left < 0) {
    const overdue = Math.abs(left);
    const text =
      overdue >= 24
        ? `${Math.floor(overdue / 24)}d overdue`
        : `${Math.max(1, Math.round(overdue))}h overdue`;
    return { tone: "breach" as const, text };
  }
  if (left <= 6) {
    return { tone: "risk" as const, text: `${Math.max(1, Math.round(left))}h left` };
  }
  const text =
    left >= 24 ? `${Math.floor(left / 24)}d ${Math.round(left % 24)}h left` : `${Math.round(left)}h left`;
  return { tone: "ok" as const, text };
}
