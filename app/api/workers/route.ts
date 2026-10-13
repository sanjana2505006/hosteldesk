import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workerSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (user.role !== "WARDEN" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only a warden or admin can add a worker." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = workerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Name, email, password, and a trade." }, { status: 400 });
  }

  const hostelId = user.role === "WARDEN" ? user.hostelId : parsed.data.hostelId;
  if (!hostelId) {
    return NextResponse.json({ error: "Pick a hostel block." }, { status: 400 });
  }

  const hostel = await prisma.hostel.findUnique({ where: { id: hostelId } });
  if (!hostel) {
    return NextResponse.json({ error: "Pick a valid hostel block." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      password: await hash(parsed.data.password, 10),
      role: "WORKER",
      trade: parsed.data.trade,
      hostelId: hostel.id,
    },
  });

  return NextResponse.json({ ok: true });
}
