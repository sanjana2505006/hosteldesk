import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check name, email, room and password." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const hostel = await prisma.hostel.findUnique({ where: { id: parsed.data.hostelId } });
  if (!hostel) {
    return NextResponse.json({ error: "Pick a valid hostel block." }, { status: 400 });
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      password: await hash(parsed.data.password, 10),
      role: "STUDENT",
      hostelId: hostel.id,
      roomNumber: parsed.data.roomNumber.trim().toUpperCase(),
    },
  });

  return NextResponse.json({ ok: true });
}
