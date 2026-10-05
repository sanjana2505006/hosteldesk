import { NextResponse } from "next/server";
import { canAssign, canViewTicket } from "@/lib/access";
import { notifyParties } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { assignSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";
import { TRADE_LABEL, tradeNeeded } from "@/lib/trades";

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
    const needed = tradeNeeded(ticket.category);
    if (user.role !== "ADMIN" && needed && worker.trade !== needed) {
      const job = TRADE_LABEL[needed].toLowerCase();
      const error = worker.trade
        ? `${worker.name} is the ${TRADE_LABEL[worker.trade].toLowerCase()}. This job needs a ${job}.`
        : `${worker.name} has no trade on file. This job needs a ${job}.`;
      return NextResponse.json({ error }, { status: 409 });
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
