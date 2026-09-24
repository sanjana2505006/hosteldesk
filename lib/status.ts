import { Role, TicketStatus } from "@prisma/client";

export const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["ASSIGNED", "REJECTED", "CLOSED"],
  ASSIGNED: ["IN_PROGRESS", "OPEN", "REJECTED"],
  IN_PROGRESS: ["WAITING_PARTS", "RESOLVED", "ASSIGNED"],
  WAITING_PARTS: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: ["OPEN"],
  REJECTED: ["OPEN"],
};

type Actor = {
  role: Role;
  isAssignee: boolean;
  isReporter: boolean;
};

export function canTransition(from: TicketStatus, to: TicketStatus, actor: Actor) {
  if (!TRANSITIONS[from].includes(to)) return false;

  if (actor.role === "ADMIN" || actor.role === "WARDEN") return true;

  if (actor.role === "WORKER") {
    if (!actor.isAssignee) return false;
    return ["IN_PROGRESS", "WAITING_PARTS", "RESOLVED"].includes(to);
  }

  if (actor.role === "STUDENT") {
    if (!actor.isReporter) return false;
    return (from === "RESOLVED" && to === "CLOSED") || (from === "CLOSED" && to === "OPEN");
  }

  return false;
}

export function nextActions(from: TicketStatus, actor: Actor): TicketStatus[] {
  return TRANSITIONS[from].filter((to) => canTransition(from, to, actor));
}
