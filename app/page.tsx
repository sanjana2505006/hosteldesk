import Link from "next/link";

const demos = [
  ["Student", "student@hosteldesk.dev", "student123"],
  ["Warden", "warden@hosteldesk.dev", "warden123"],
  ["Worker", "worker@hosteldesk.dev", "worker123"],
  ["Admin", "admin@hosteldesk.dev", "admin123"],
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <p className="font-medium text-ink">HostelDesk</p>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="text-ink/70 hover:text-ink">
              Login
            </Link>
            <Link href="/register" className="text-ink/70 hover:text-ink">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-ink">Hostel complaint desk</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/75">
          A student files a complaint for their room. The warden assigns a worker. The ticket then moves
          through open, assigned, in progress, and resolved. If it sits too long, the inbox marks it late.
        </p>
        <div className="mt-5">
          <Link href="/login" className="rounded-md bg-forest px-4 py-2 text-sm text-white">
            Login
          </Link>
        </div>

        <h2 className="mt-10 text-base font-semibold text-ink">Demo accounts</h2>
        <p className="mt-1 text-sm text-ink/60">These are seeded. Use them to click around.</p>
        <div className="mt-3 overflow-x-auto rounded-md border border-line bg-panel">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-ink/60">
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
        <p className="mt-3 text-sm text-ink/60">
          HD-1041 is a leak that is already late. HD-1044 is waiting on a part, so its clock is paused.
        </p>

        <h2 className="mt-10 text-base font-semibold text-ink">Who sees what</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink/75">
          <li>Student: only their own tickets. They can file one, comment, and close a resolved ticket after a rating.</li>
          <li>Warden: tickets for their hostel. They assign workers and can change priority.</li>
          <li>Worker: only jobs assigned to them. They move the status.</li>
          <li>Admin: every hostel.</li>
        </ul>
      </main>
    </div>
  );
}
