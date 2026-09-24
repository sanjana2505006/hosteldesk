import { NextResponse } from "next/server";
import { canViewTicket } from "@/lib/access";
import { notifyParties } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Write a short update." }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket || !canViewTicket(user, ticket)) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const text = parsed.data.message.trim();
  const preview = text.length > 90 ? `${text.slice(0, 87)}…` : text;

  const event = await prisma.ticketEvent.create({
    data: {
      ticketId: ticket.id,
      actorId: user.id,
      type: "COMMENTED",
      message: text,
    },
  });

  await notifyParties(ticket, user.id, `${user.name ?? "Someone"} on ${ticket.ref}: ${preview}`);

  return NextResponse.json({ event }, { status: 201 });
}
