import { Role } from "@prisma/client";

type Viewer = {
  id: string;
  role: Role;
  hostelId?: string | null;
};

type TicketScope = {
  hostelId: string;
  reporterId: string;
  assigneeId?: string | null;
};

export function canViewTicket(user: Viewer, ticket: TicketScope) {
  if (user.role === "ADMIN") return true;
  if (user.role === "WARDEN") {
    return !user.hostelId || user.hostelId === ticket.hostelId;
  }
  if (user.role === "WORKER") return ticket.assigneeId === user.id;
  return ticket.reporterId === user.id;
}

export function canAssign(role: Role) {
  return role === "WARDEN" || role === "ADMIN";
}

export function ticketWhereFor(user: Viewer) {
  if (user.role === "ADMIN") return {};
  if (user.role === "WARDEN") {
    return user.hostelId ? { hostelId: user.hostelId } : {};
  }
  if (user.role === "WORKER") return { assigneeId: user.id };
  return { reporterId: user.id };
}
