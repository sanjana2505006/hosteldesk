import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const api = process.env.EXPRESS_URL;
  const key = process.env.DESK_API_KEY;
  if (!api || !key) {
    return NextResponse.json({ error: "Notice API is not configured." }, { status: 500 });
  }

  const upstream = await fetch(`${api}/notices/${params.id}/seen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-desk-key": key,
    },
    body: JSON.stringify({
      userId: user.id,
      name: user.name ?? "Someone",
    }),
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json({ error: "Notice API is not running. Start it with npm run server." }, { status: 502 });
  }

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json({ error: data?.error ?? "Could not mark it." }, { status: upstream.status });
  }

  return NextResponse.json(data);
}
