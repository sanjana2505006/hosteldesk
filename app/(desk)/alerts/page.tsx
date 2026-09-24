import Link from "next/link";
import { redirect } from "next/navigation";
import { MarkAlertsRead } from "@/components/alert-actions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const alerts = await prisma.alert.findMany({
    where: { userId: user.id },
    include: { ticket: { select: { id: true, ref: true } } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const unread = alerts.filter((alert) => !alert.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-ink">Alerts</h1>
          <p className="mt-1 text-sm text-ink/55">
            Pings for tickets you didn&apos;t just touch. Opening one clears it.
          </p>
        </div>
        {unread ? <MarkAlertsRead /> : null}
      </div>

      <section className="overflow-hidden rounded-lg border border-line bg-panel shadow-desk">
        {alerts.length ? (
          alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/tickets/${alert.ticket.id}`}
              className={`block border-b border-line px-4 py-4 hover:bg-[#fbf6ec] ${
                alert.readAt ? "" : "bg-[#fbf6ec]"
              }`}
            >
              <p className="font-mono text-xs text-forest">{alert.ticket.ref}</p>
              <p className={`mt-1 text-sm ${alert.readAt ? "text-ink/65" : "font-medium text-ink"}`}>
                {alert.message}
              </p>
              <p className="mt-1 text-[11px] text-ink/40">{formatDate(alert.createdAt)}</p>
            </Link>
          ))
        ) : (
          <p className="px-4 py-10 text-sm text-ink/50">
            Nothing yet. You&apos;ll see a row when someone files, assigns, or updates a ticket you are on.
          </p>
        )}
      </section>
    </div>
  );
}
