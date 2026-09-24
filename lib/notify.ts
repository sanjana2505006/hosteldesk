import { prisma } from "@/lib/prisma";

type TicketBits = {
  id: string;
  hostelId: string;
  reporterId: string;
  assigneeId?: string | null;
};

async function insert(userIds: string[], actorId: string, ticketId: string, message: string) {
  const ids = Array.from(new Set(userIds)).filter((id) => id && id !== actorId);
  if (!ids.length) return;

  await prisma.alert.createMany({
    data: ids.map((userId) => ({
      userId,
      ticketId,
      message,
    })),
  });
}

export async function notifyWardens(hostelId: string, actorId: string, ticketId: string, message: string) {
  const wardens = await prisma.user.findMany({
    where: { role: "WARDEN", hostelId },
    select: { id: true },
  });
  await insert(
    wardens.map((warden) => warden.id),
    actorId,
    ticketId,
    message,
  );
}

// Reporter and assignee. If nobody is assigned yet, the block warden gets it instead.
export async function notifyParties(ticket: TicketBits, actorId: string, message: string) {
  const ids = [ticket.reporterId];
  if (ticket.assigneeId) {
    ids.push(ticket.assigneeId);
  } else {
    const wardens = await prisma.user.findMany({
      where: { role: "WARDEN", hostelId: ticket.hostelId },
      select: { id: true },
    });
    for (const warden of wardens) ids.push(warden.id);
  }
  await insert(ids, actorId, ticket.id, message);
}
