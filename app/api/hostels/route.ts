import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const hostels = await prisma.hostel.findMany({
    orderBy: { block: "asc" },
    select: { id: true, name: true, block: true },
  });
  return NextResponse.json({ hostels });
}
