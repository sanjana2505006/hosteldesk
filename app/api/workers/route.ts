import { NextResponse } from "next/server";
import { canAssign } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!canAssign(user.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const workers = await prisma.user.findMany({
    where: {
      role: "WORKER",
      ...(user.role === "WARDEN" && user.hostelId ? { hostelId: user.hostelId } : {}),
    },
    select: { id: true, name: true, email: true, hostel: { select: { block: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ workers });
}
