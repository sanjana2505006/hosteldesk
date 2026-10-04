import { NextResponse } from "next/server";
import { canAssign, canViewTicket } from "@/lib/access";
import { PRIORITY_LABEL } from "@/lib/labels";
import { notifyParties } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { prioritySchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";
import { SLA_HOURS } from "@/lib/sla";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

const DONE = ["RESOLVED", "CLOSED", "REJECTED"];

export async function POST(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!canAssign(user.role)) {
    return NextResponse.json({ error: "Only a warden or admin can change priority." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = prioritySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pick a priority." }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket || !canViewTicket(user, ticket)) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  if (DONE.includes(ticket.status)) {
    return NextResponse.json({ error: "The clock already stopped on this ticket." }, { status: 409 });
  }

  if (parsed.data.priority === ticket.priority) {
    return NextResponse.json({ error: "It is already that priority." }, { status: 400 });
  }

  const label = PRIORITY_LABEL[parsed.data.priority];
  const was = PRIORITY_LABEL[ticket.priority];
  const hours = SLA_HOURS[parsed.data.priority];
  const message = `Priority → ${label} (was ${was}). Window is now ${hours} hours from when it was filed.`;

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      priority: parsed.data.priority,
      events: {
        create: {
          actorId: user.id,
          type: "PRIORITY_CHANGED",
          message,
        },
      },
    },
  });

  await notifyParties(ticket, user.id, `${ticket.ref}: ${message}`);

  return NextResponse.json({ ticket: updated });
}
