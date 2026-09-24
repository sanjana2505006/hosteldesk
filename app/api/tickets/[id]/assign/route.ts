import { NextResponse } from "next/server";
import { canAssign, canViewTicket } from "@/lib/access";
import { notifyParties } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { assignSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!canAssign(user.role)) {
    return NextResponse.json({ error: "Only a warden or admin can assign work." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pick a worker." }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket || !canViewTicket(user, ticket)) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  let assigneeName = "unassigned";
  if (parsed.data.assigneeId) {
    const worker = await prisma.user.findUnique({ where: { id: parsed.data.assigneeId } });
    if (!worker || worker.role !== "WORKER") {
      return NextResponse.json({ error: "That account is not a worker." }, { status: 400 });
    }
    assigneeName = worker.name;
  }

  const nextStatus = parsed.data.assigneeId ? "ASSIGNED" : "OPEN";

  const message = parsed.data.assigneeId
    ? `Assigned to ${assigneeName}`
    : "Unassigned — back to open queue";

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      assigneeId: parsed.data.assigneeId,
      status: nextStatus,
      events: {
        create: {
          actorId: user.id,
          type: parsed.data.assigneeId ? "ASSIGNED" : "STATUS_CHANGED",
          message,
        },
      },
    },
  });

  if (parsed.data.assigneeId !== ticket.assigneeId) {
    await notifyParties(
      { ...ticket, assigneeId: parsed.data.assigneeId ?? ticket.assigneeId },
      user.id,
      `${ticket.ref} ${message.charAt(0).toLowerCase()}${message.slice(1)}`,
    );
  }

  return NextResponse.json({ ticket: updated });
}
