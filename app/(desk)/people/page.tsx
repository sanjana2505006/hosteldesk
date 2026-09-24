import { redirect } from "next/navigation";
import { ROLE_LABEL } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatScore(score?: { avg: number; count: number }) {
  if (!score) return "—";
  const closes = score.count === 1 ? "1 close" : `${score.count} closes`;
  return `${score.avg.toFixed(1)} · ${closes}`;
}

export default async function PeoplePage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (user.role !== "WARDEN" && user.role !== "ADMIN") redirect("/inbox");

  const people = await prisma.user.findMany({
    where: user.role === "WARDEN" && user.hostelId ? { hostelId: user.hostelId } : {},
    include: { hostel: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const scores = await prisma.ticket.groupBy({
    by: ["assigneeId"],
    where: {
      rating: { not: null },
      assigneeId: { not: null },
      ...(user.role === "WARDEN" && user.hostelId ? { hostelId: user.hostelId } : {}),
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const ratingByWorker = new Map<string, { avg: number; count: number }>();
  for (const row of scores) {
    if (!row.assigneeId || row._avg.rating == null) continue;
    ratingByWorker.set(row.assigneeId, { avg: row._avg.rating, count: row._count.rating });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-ink">People</h1>
        <p className="mt-1 text-sm text-ink/55">
          Students, workers and staff attached to this desk. Worker ratings come from tickets a student closed.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-panel shadow-desk">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Hostel</th>
              <th className="px-4 py-2">Room</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-b border-line/70">
                <td className="px-4 py-3 font-medium">{person.name}</td>
                <td className="px-4 py-3">{ROLE_LABEL[person.role]}</td>
                <td className="px-4 py-3">{person.hostel ? `${person.hostel.name} · ${person.hostel.block}` : "—"}</td>
                <td className="px-4 py-3">{person.roomNumber ?? "—"}</td>
                <td className="px-4 py-3">
                  {person.role === "WORKER" ? formatScore(ratingByWorker.get(person.id)) : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{person.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
