import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "login first" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!me?.hostelId) {
    return NextResponse.json({ error: "your account has no hostel" }, { status: 400 });
  }

  const body = await req.json();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const category = String(body.category || "").trim();
  const priority = body.priority || "MEDIUM";
  const roomNo = String(body.roomNo || me.roomNo || "").trim();

  if (!title || !description || !category || !roomNo) {
    return NextResponse.json({ error: "fill all the fields" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      category,
      priority,
      roomNo,
      hostelId: me.hostelId,
      createdById: me.id,
    },
  });

  return NextResponse.json({ ticket });
}
