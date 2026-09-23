import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const hostelId = String(body.hostelId || "");
  const roomNo = String(body.roomNo || "").trim();

  if (!name || !email || !password || !hostelId || !roomNo) {
    return NextResponse.json({ error: "fill all the fields" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "password should be 6+ chars" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "email already used" }, { status: 400 });
  }

  const hostel = await prisma.hostel.findUnique({ where: { id: hostelId } });
  if (!hostel) {
    return NextResponse.json({ error: "pick a valid hostel" }, { status: 400 });
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: await hash(password, 10),
      role: "STUDENT",
      hostelId,
      roomNo,
    },
  });

  return NextResponse.json({ ok: true });
}
