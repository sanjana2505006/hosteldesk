import { NextResponse } from "next/server";
import { noticeSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (user.role !== "WARDEN" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only a warden or admin can post a notice." }, { status: 403 });
  }
  if (user.role === "WARDEN" && !user.hostelId) {
    return NextResponse.json({ error: "Your account is not attached to a hostel block." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = noticeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Title needs 4+ characters and a short body." }, { status: 400 });
  }

  const api = process.env.EXPRESS_URL;
  const key = process.env.DESK_API_KEY;
  if (!api || !key) {
    return NextResponse.json({ error: "Notice API is not configured." }, { status: 500 });
  }

  const upstream = await fetch(`${api}/notices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-desk-key": key,
    },
    body: JSON.stringify({
      title: parsed.data.title.trim(),
      body: parsed.data.body.trim(),
      authorName: user.name ?? "Staff",
      hostelId: user.role === "ADMIN" ? "" : user.hostelId,
      hostelLabel: user.role === "ADMIN" ? "Campus" : user.hostelName || "Hostel",
    }),
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json({ error: "Notice API is not running. Start it with npm run server." }, { status: 502 });
  }

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json({ error: data?.error ?? "Could not post the notice." }, { status: upstream.status });
  }

  return NextResponse.json(data, { status: 201 });
}
