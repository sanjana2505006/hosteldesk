import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readAlertsSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = readAlertsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const result = await prisma.alert.updateMany({
    where: {
      userId: user.id,
      readAt: null,
      ...(parsed.data.id ? { id: parsed.data.id } : {}),
      ...(parsed.data.ticketId ? { ticketId: parsed.data.ticketId } : {}),
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
