import { NextResponse } from "next/server";
import { canViewTicket } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      hostel: true,
      reporter: { select: { id: true, name: true, email: true, roomNumber: true } },
      assignee: { select: { id: true, name: true, email: true } },
      events: {
        include: { actor: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket || !canViewTicket(user, ticket)) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}
