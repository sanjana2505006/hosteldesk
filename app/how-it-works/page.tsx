import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { PRIORITY_LABEL, PRIORITIES, STATUS_LABEL, STATUSES } from "@/lib/labels";
import { SLA_HOURS } from "@/lib/sla";
import { TRANSITIONS } from "@/lib/status";

const roles = [
  ["Student", "Files a complaint for their own room. Closes it when the fix is done and leaves a rating from 1 to 5."],
  ["Warden", "Sees that block's queue and assigns a worker who does that kind of work."],
  ["Worker", "Sees only the jobs assigned to them, then marks the work in progress, waiting on parts, or resolved."],
];

const demos = [
  ["Student", "student@hosteldesk.dev", "student123"],
  ["Warden", "warden@hosteldesk.dev", "warden123"],
  ["Worker", "worker@hosteldesk.dev", "worker123"],
  ["Admin", "admin@hosteldesk.dev", "admin123"],
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-14">
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">How a complaint moves.</h1>
        <p className="mt-4 max-w-xl text-[19px] leading-snug text-ink/60">
          A student files it, a warden assigns someone, and a worker does the job. The server rejects a status jump
          that is not in the table below.
        </p>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink">Who uses it</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {roles.map(([role, line]) => (
            <div key={role} className="rounded-2xl bg-paper px-4 py-4">
              <p className="font-medium text-ink">{role}</p>
              <p className="mt-1 text-base text-ink/60">{line}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink">Try a demo account</h2>
        <p className="mt-2 text-[17px] text-ink/60">
          Each login only sees its own queue.{" "}
          <Link href="/login" className="text-forest hover:underline">
            Sign in
          </Link>{" "}
          and use one of these.
        </p>
        <div className="mt-3 overflow-x-auto rounded-2xl bg-paper">
          <table className="w-full text-left text-base">
            <thead className="border-b border-line text-ink/55">
              <tr>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Password</th>
              </tr>
            </thead>
            <tbody>
              {demos.map(([role, email, password]) => (
                <tr key={email} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{role}</td>
                  <td className="px-3 py-2">{email}</td>
                  <td className="px-3 py-2">{password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink">After a student files it</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-7 text-ink/80">
          <li>The student files it: title, room, category, priority. The same room cannot have two open tickets in one category.</li>
          <li>The warden assigns a worker and can raise or lower the priority while it is still open.</li>
          <li>The worker marks it in progress, waiting on parts, or resolved. Waiting on parts needs the part name, and that time does not count on the SLA clock.</li>
          <li>The student closes a resolved ticket and rates the fix from 1 to 5. An open ticket with nobody assigned can be taken back.</li>
        </ol>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink">Status moves</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl bg-paper">
          <table className="w-full text-left text-base">
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

        <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink">How long before it is late</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl bg-paper">
          <table className="w-full max-w-md text-left text-base">
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
