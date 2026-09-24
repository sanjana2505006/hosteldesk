import { NextResponse } from "next/server";
import { ticketWhereFor } from "@/lib/access";
import { notifyWardens } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { createTicketSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";
import { generateRef } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const tickets = await prisma.ticket.findMany({
    where: ticketWhereFor(user),
    include: {
      hostel: true,
      reporter: { select: { id: true, name: true, roomNumber: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!user.hostelId) {
    return NextResponse.json(
      { error: "Your account is not attached to a hostel block." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Fill every field — title needs 4+ characters." }, { status: 400 });
  }

  let ref = generateRef();
  for (let i = 0; i < 5; i += 1) {
    const clash = await prisma.ticket.findUnique({ where: { ref } });
    if (!clash) break;
    ref = generateRef();
  }

  const ticket = await prisma.ticket.create({
    data: {
      ref,
      title: parsed.data.title.trim(),
      description: parsed.data.description.trim(),
      category: parsed.data.category,
      priority: parsed.data.priority,
      roomNumber: parsed.data.roomNumber.trim().toUpperCase(),
      photoUrl: parsed.data.photoUrl || null,
      hostelId: user.hostelId,
      reporterId: user.id,
      events: {
        create: {
          actorId: user.id,
          type: "CREATED",
          message: "Ticket opened",
        },
      },
    },
  });

  await notifyWardens(
    user.hostelId,
    user.id,
    ticket.id,
    `${user.name ?? "A student"} filed ${ticket.ref}: ${ticket.title}`,
  );

  return NextResponse.json({ ticket }, { status: 201 });
}
