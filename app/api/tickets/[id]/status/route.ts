import { NextResponse } from "next/server";
import { STATUS_LABEL } from "@/lib/labels";
import { canViewTicket } from "@/lib/access";
import { notifyParties } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { statusSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";
import { canTransition } from "@/lib/status";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket || !canViewTicket(user, ticket)) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const allowed = canTransition(ticket.status, parsed.data.status, {
    role: user.role,
    isAssignee: ticket.assigneeId === user.id,
    isReporter: ticket.reporterId === user.id,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Cannot move this ticket from ${STATUS_LABEL[ticket.status]} to ${STATUS_LABEL[parsed.data.status]}.` },
      { status: 409 },
    );
  }

  if (parsed.data.status === "ASSIGNED" && !ticket.assigneeId) {
    return NextResponse.json({ error: "Assign a worker before marking it assigned." }, { status: 400 });
  }

  const resolvedAt =
    parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED"
      ? ticket.resolvedAt ?? new Date()
      : parsed.data.status === "OPEN" || parsed.data.status === "IN_PROGRESS"
        ? null
        : ticket.resolvedAt;

  const note = parsed.data.note?.trim();
  const message = note
    ? `Status → ${STATUS_LABEL[parsed.data.status]}. ${note}`
    : `Status → ${STATUS_LABEL[parsed.data.status]}`;

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: parsed.data.status,
      resolvedAt,
      assigneeId: parsed.data.status === "OPEN" ? null : ticket.assigneeId,
      events: {
        create: {
          actorId: user.id,
          type: "STATUS_CHANGED",
          message,
        },
      },
    },
  });

  await notifyParties(ticket, user.id, `${ticket.ref}: ${message}`);

  return NextResponse.json({ ticket: updated });
}
