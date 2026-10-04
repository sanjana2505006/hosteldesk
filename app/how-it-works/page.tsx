import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { PRIORITY_LABEL, PRIORITIES, STATUS_LABEL, STATUSES } from "@/lib/labels";
import { SLA_HOURS } from "@/lib/sla";
import { TRANSITIONS } from "@/lib/status";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-ink">How a complaint moves</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">
          This is the path a ticket takes after a student files it. The server rejects a jump that is not in the
          table below.
        </p>

        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink/80">
          <li>The student files it: title, room, category, priority. The same room cannot have two open tickets in one category.</li>
          <li>The warden assigns a worker and can raise or lower the priority while it is still open.</li>
          <li>The worker marks it in progress, waiting on parts, or resolved. Waiting on parts needs the part name, and that time does not count on the SLA clock.</li>
          <li>The student closes a resolved ticket and rates the fix from 1 to 5. An open ticket with nobody assigned can be taken back.</li>
        </ol>

        <h2 className="mt-10 text-base font-semibold text-ink">Status moves</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-ink/55">
              <tr>
                <th className="px-3 py-2 font-medium">From</th>
                <th className="px-3 py-2 font-medium">Can go to</th>
              </tr>
            </thead>
            <tbody>
              {STATUSES.map((status) => (
                <tr key={status} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{STATUS_LABEL[status]}</td>
                  <td className="px-3 py-2">
                    {TRANSITIONS[status].map((next) => STATUS_LABEL[next]).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-base font-semibold text-ink">How long before it is late</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
          <table className="w-full max-w-md text-left text-sm">
            <thead className="border-b border-line text-ink/55">
              <tr>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Hours</th>
              </tr>
            </thead>
            <tbody>
              {PRIORITIES.map((priority) => (
                <tr key={priority} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{PRIORITY_LABEL[priority]}</td>
                  <td className="px-3 py-2">{SLA_HOURS[priority]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          Resolved, closed, and rejected tickets are not late. See them on the{" "}
          <Link href="/complaints" className="text-forest underline">
            complaints
          </Link>{" "}
          page.
        </p>
      </main>
    </div>
  );
}
